import { Axios, AxiosObservable } from 'axios-observable';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from './auth/user.model';
import { Config } from './config';

export class Auth0 {
  private readonly oAuthUrl: string;
  private readonly authorizedEmails: string[];
  private readonly testMode: boolean;

  constructor(config: Config) {
    this.oAuthUrl = config.oAuthUrl;
    this.authorizedEmails = config.authorizedEmails;
    this.testMode = config.testMode;
  }

  private checkUser(token: string): AxiosObservable<User> {
    const url = `${this.oAuthUrl}/userinfo/`;

    return Axios.get(url, {
      headers: {
        authorization: 'Bearer ' + token,
        'Accept-Encoding': 'gzip'
      }
    });
  }

  public checkToken(request: Request): Observable<boolean> {
    const token = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;

    if (this.testMode && token === 'access-token-from-skill') {
      return of(true);
    }

    return this.checkUser(token).pipe(
      map(result => {
        if (result.status === 200) {
          return this.authorizedEmails.indexOf(result.data.email) > -1;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }
}
