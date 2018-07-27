import {Observable} from 'rxjs';
import {of} from 'rxjs/internal/observable/of';
import {Capability, CapabilityHandler} from './capability-handler';

export interface TemperatureControl extends Capability {
  getTemperature(): Observable<any>;
}

export class TemperatureControlHandler implements CapabilityHandler<TemperatureControl> {
  public static INSTANCE = new TemperatureControlHandler();

  getCommands(): string[] {
    return [
      'action.devices.commands.TemperatureSetting'
    ];
  }

  getAttributes(component: TemperatureControl): any {
    return {
      'temperatureRange': {
        'minThresholdCelsius': 30,
        'maxThresholdCelsius': 100
      },
      'temperatureStepCelsius': 1,
      'temperatureUnitForUX': 'C'
    }
  }

  getState(component: TemperatureControl): Observable<any> {
    return component.getTemperature();
  }

  getTrait(): string {
    return 'action.devices.traits.TemperatureSetting';
  }

  handleCommands(component: TemperatureControl, command: string, payload?: any): Observable<boolean> {
    console.log('No TemperatureComponent control handle');
    return of(true);
  }
}
