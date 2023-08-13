import { map, Observable, of, Subject } from 'rxjs';
import { CapabilityHandler } from '../capabilities/capability-handler';
import { TemperatureSetting, TemperatureSettingHandler, TemperatureState } from '../capabilities/temperature-setting';
import { ComponentRaw } from '../config';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';
import { OnOff, OnOffHandler } from '../capabilities/on-off';
import { ErrorType } from '../error';

export class AirCoolerComponent extends Component implements OnOff, TemperatureSetting {
  private on: boolean;
  protected temperatureState: TemperatureState = new TemperatureState();

  constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    super(rawComponent, loxoneRequest, statesEvents);

    this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(temperature => {
      this.loxoneRequest.watchComponent(temperature.states.temperature).subscribe((event) => {
        if(event === 0) {
          console.log('Ambient temperature not managed by the airconditionner, try to find a a sensor in the same room.');
          // TODO : unsubscribe the current event
          // TODO : find in the same room a temperature sensor
        }
        
        this.temperatureState.thermostatTemperatureAmbient = parseInt(event); // Current temp is not returned by Loxone
        this.statesEvents.next(this);
      });
      this.loxoneRequest.watchComponent(temperature.states.status).subscribe((event) => {
        switch (parseInt(event)) {
          case 0: this.on = false; break;
          case 1: this.on = true; break;
        }
        this.statesEvents.next(this);
      });
      this.loxoneRequest.watchComponent(temperature.states.targetTemperature).subscribe((event) => {
        this.temperatureState.thermostatTemperatureSetpoint = parseInt(event, 10);
        this.statesEvents.next(this);
      });
      this.loxoneRequest.watchComponent(temperature.states.mode).subscribe((event) => {
        switch (parseInt(event)) {
          case 1: this.temperatureState.thermostatMode = 'auto'; break;
          case 2: this.temperatureState.thermostatMode = 'heat'; break;
          case 3: this.temperatureState.thermostatMode = 'cool'; break;
          case 4: this.temperatureState.thermostatMode = 'dry'; break;
          case 5: this.temperatureState.thermostatMode = 'fan-only'; break;
        }
        this.statesEvents.next(this);
      });
    });
  }

  turnOn(): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, 'on').pipe(map((result) => {
      if (result.code === '200') {
        this.on = true;
        this.statesEvents.next(this);
        return true;
      }
      throw new Error(ErrorType.ENDPOINT_UNREACHABLE)
    }))
  }

  turnOff(): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, 'off').pipe(map((result) => {
      if (result.code === '200') {
        this.on = false;
        this.statesEvents.next(this);
        return true;
      }
      throw new Error(ErrorType.ENDPOINT_UNREACHABLE);
    }));
  }

  getPowerState(): Observable<boolean> {
    return of(this.on);
  }

  getCapabilities(): CapabilityHandler<any>[] {
    return [
      OnOffHandler.INSTANCE,
      TemperatureSettingHandler.INSTANCE
    ];
  }

  getTemperature(): Observable<TemperatureState> {
    return of(this.temperatureState)
  }

  setTemperature(temp: number): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, `setTarget/${temp}`).pipe(map((result) => {
      if (result.code === '200') {
        this.temperatureState.thermostatTemperatureSetpoint = temp;
        this.statesEvents.next(this);
        return true;
      }
      throw new Error(ErrorType.ENDPOINT_UNREACHABLE);
    }));
  }

  setMode(mode: string): Observable<boolean> {
    let loxoneMode: number;
    switch (mode) {
      case 'auto': loxoneMode = 1; break;
      case 'heat': loxoneMode = 2; break;
      case 'cool': loxoneMode = 3; break;
      case 'dry': loxoneMode = 4; break;
      case 'fan-only': loxoneMode = 5; break;
    }

    return this.loxoneRequest.sendCmd(this.loxoneId, `setMode/${loxoneMode}`).pipe(map((result) => {
      if (result.code === '200') {
        this.temperatureState.thermostatMode = mode;
        this.statesEvents.next(this);
        return true;
      }
      throw new Error(ErrorType.ENDPOINT_UNREACHABLE);
    }));
  }
}
