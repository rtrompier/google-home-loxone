import {Observable, of, Subject} from 'rxjs/index';
import {CapabilityHandler} from '../capabilities/capability-handler';
import {TemperatureSetting, TemperatureSettingHandler, TemperatureState} from '../capabilities/temperature-setting';
import {ComponentRaw} from '../config';
import {LoxoneRequest} from '../loxone-request';
import {Component} from './component';

export class TemperatureComponent extends Component implements TemperatureSetting {
  protected temperatureState: TemperatureState = new TemperatureState();

  constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    super(rawComponent, loxoneRequest, statesEvents);

    this.loxoneRequest.watchComponent(this.loxoneId).subscribe(event => {
      this.temperatureState.thermostatTemperatureAmbient = parseInt(event, 10);
    })
  }

  getCapabilities(): CapabilityHandler<any>[] {
    return [
      TemperatureSettingHandler.INSTANCE
    ];
  }

  getTemperature(): Observable<TemperatureState> {
    return of(this.temperatureState)
  }
}
