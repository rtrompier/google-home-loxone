import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { Capability, CapabilityHandler } from './capability-handler';

export interface Brightness extends Capability {
  setBrightness(value: number): Observable<boolean>;

  getBrightnessState(): Observable<number>;
}

export class BrightnessHandler implements CapabilityHandler<Brightness> {
  public static INSTANCE = new BrightnessHandler();

  getCommands(): string[] {
    return ['action.devices.commands.BrightnessAbsolute'];
  }

  getTrait(): string {
    return 'action.devices.traits.Brightness'
  }

  getAttributes(component: Brightness): any {
    return {}
  }

  getState(component: Brightness): Observable<any> {
    return component.getBrightnessState().pipe(
      map(val => {
        return {
          brightness: val
        }
      })
    );
  }

  handleCommands(component: Brightness, command: string, payload?: any): Observable<any> {
    if (payload['brightness']) {
      return component.setBrightness(+payload['brightness']);
    } else {
      // TODO : Error
    }
  }
}
