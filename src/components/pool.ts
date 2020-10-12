import { Subject } from 'rxjs';
import { TemperatureSetting } from '../capabilities/temperature-setting';
import { ComponentRaw } from '../config';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';
import { TemperatureComponent } from './temperature';

export class PoolComponent extends TemperatureComponent implements TemperatureSetting {
  private pumpId: string;

  constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    super(rawComponent, loxoneRequest, statesEvents);

    this.pumpId = rawComponent.customData['pumpId'];

    // Not working for now
    // this.loxoneRequest.getControlInformation(this.pumpId).subscribe(_switch => {
    //   this.loxoneRequest.watchComponent(_switch['states']['active']).subscribe(event => {
    //     this.temperatureState.thermostatMode = event === 1 ? 'on' : 'off';
    //   })
    // });
    this.temperatureState.thermostatMode = 'off';
  }
}
