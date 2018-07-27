import {Observable} from 'rxjs';
import {of} from 'rxjs/internal/observable/of';
import {Capability, CapabilityHandler} from './capability-handler';
import {TemperatureControl} from './temperature-control';


export class TemperatureState {
  thermostatMode: string;
  thermostatTemperatureSetpoint: number;
  thermostatTemperatureAmbient: number;
  thermostatHumidityAmbient: number;
}

export interface TemperatureSetting extends Capability {
  getTemperature(): Observable<TemperatureState>;
}

export class TemperatureSettingHandler implements CapabilityHandler<TemperatureSetting> {
  public static INSTANCE = new TemperatureSettingHandler();

  getCommands(): string[] {
    return [
      'action.devices.commands.ThermostatTemperatureSetpoint',
      'action.devices.commands.ThermostatTemperatureSetRange',
      'action.devices.commands.ThermostatSetMode'
    ];
  }

  getState(component: TemperatureSetting): Observable<any> {
    return component.getTemperature();
  }

  getTrait(): string {
    return 'action.devices.traits.TemperatureSetting';
  }

  getAttributes(component: TemperatureControl): any {
    return {
      'availableThermostatModes': 'off,on',
      'thermostatTemperatureUnit': 'C'
    }
  }

  handleCommands(component: TemperatureSetting, command: string, payload?: any): Observable<boolean> {
    console.log('No TemperatureComponent control handle');
    return of(true);
  }
}
