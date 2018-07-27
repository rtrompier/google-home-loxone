import {Observable} from 'rxjs';
import {of} from 'rxjs/internal/observable/of';
import {Capability, CapabilityHandler} from './capability-handler';

/* tslint:disable no-empty-interface */
export interface EndpointHealth extends Capability {
  getHealthCheck(): Observable<any>;
}

export class EndpointHealthHandler implements CapabilityHandler<EndpointHealth> {
  public static INSTANCE = new EndpointHealthHandler();

  getTrait(): string {
    return null;
  }

  getAttributes(component: EndpointHealth): any {
    return {}
  }

  getState(component: EndpointHealth): Observable<any> {
    return component.getHealthCheck();
  }

  handleCommands(component: EndpointHealth, command: string, payload?: any): Observable<boolean> {
    return of(true);
  }

  getCommands(): string[] {
    return [];
  }
}
