import { RxHR, RxHttpRequestResponse } from '@akanass/rx-http-request';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map } from 'rxjs/operators';
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

  private checkUser(token: string): Observable<RxHttpRequestResponse> {
    const url = `${this.oAuthUrl}/userinfo/`;

    return RxHR.get(url, {
      gzip: true,
      headers: {
        authorization: 'Bearer ' + token
      }
    });
  }

  public checkToken(request: any): Observable<boolean> {
    const token = request.headers.authorization ?
      request.headers.authorization.split(' ')[1] : null;

    if (this.testMode && token === 'access-token-from-skill') {
      return of(true);
    }

    // TODO : Remove
    return of(true);

    // return this.checkUser(token).pipe(
    //   map(result => {
    //     if (result.response.statusCode === 200) {
    //       const user = JSON.parse(result.response.body);
    //       return this.authorizedEmails.indexOf(user.email) > -1;
    //     }
    //     return false;
    //   },
    //     catchError(() => of(false))
    //   ));
  }
}
