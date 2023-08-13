import { Observable, map, of } from 'rxjs';
import { Capability, CapabilityHandler } from './capability-handler';
import { TemperatureControl } from './temperature-control';


export class TemperatureState {
  thermostatMode: string;
  thermostatTemperatureSetpoint: number;
  thermostatTemperatureAmbient: number;
  thermostatHumidityAmbient: number;
}

export interface TemperatureSetting extends Capability {
  getTemperature(): Observable<TemperatureState>;

  setTemperature(temp: number): Observable<boolean>;

  setMode(mode: string): Observable<boolean>;
}

export class TemperatureSettingHandler implements CapabilityHandler<TemperatureSetting> {
  public static INSTANCE = new TemperatureSettingHandler();

  getCommands(): string[] {
    return [
      'action.devices.commands.ThermostatTemperatureSetpoint',
      'action.devices.commands.ThermostatSetMode',
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
      'availableThermostatModes': 'off,on,heat,cool,heatcool,auto,dry,fan-only',
      'thermostatTemperatureUnit': 'C'
    }
  }

  handleCommands(component: TemperatureSetting, command: string, payload?: any): Observable<boolean> {
    switch (command) {
      case 'action.devices.commands.ThermostatTemperatureSetpoint':
        return component.setTemperature(payload.thermostatTemperatureSetpoint)
          .pipe(map(() => true));
      case 'action.devices.commands.ThermostatSetMode':
        return component.setMode(payload.thermostatMode)
          .pipe(map(() => true));
      default:
        return of(true);
    }
  }
}
