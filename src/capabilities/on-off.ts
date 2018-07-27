import {Observable} from 'rxjs/internal/Observable';
import {map} from 'rxjs/operators';
import {Capability, CapabilityHandler} from './capability-handler';

export interface OnOff extends Capability {
  turnOn(): Observable<boolean>;

  turnOff(): Observable<boolean>;

  getPowerState(): Observable<boolean>;
}

export class OnOffHandler implements CapabilityHandler<OnOff> {
  public static INSTANCE = new OnOffHandler();

  getCommands(): string[] {
    return ['action.devices.commands.OnOff'];
  }

  getTrait(): string {
    return 'action.devices.traits.OnOff'
  }

  getAttributes(component: OnOff): any {
    return {}
  }

  getState(component: OnOff): Observable<any> {
    return component.getPowerState().pipe(map(result => {
      return {
        on: result
      }
    }));
  }

  handleCommands(component: OnOff, command: string, payload?: any): Observable<any> {
    if (payload['on']) {
      return component.turnOn();
    } else {
      return component.turnOff()
    }
  }
}
