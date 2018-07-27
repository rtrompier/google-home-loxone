import {Subject} from 'rxjs/internal/Subject';
import {Config} from '../config';
import {LoxoneRequest} from '../loxone-request';
import {Component} from './component';
import {CustomOnOff} from './custom-on-off';
import {DoorComponent} from './door';
import {JalousieComponent} from './jalousie';
import {LightComponent} from './light';
import {PoolComponent} from './pool';
import {TemperatureComponent} from './temperature';

export class ComponentsFactory {
  private readonly components: { [key: string]: Component } = {};

  constructor(config: Config, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    config.components
      .forEach(rawComponent => {
        let component: Component;
        switch (rawComponent.loxoneType) {
          case 'Light':
            component = new LightComponent(rawComponent, loxoneRequest, statesEvents);
            break;
          case 'Door':
            component = new DoorComponent(rawComponent, loxoneRequest, statesEvents);
            break;
          case 'Pool':
            component = new PoolComponent(rawComponent, loxoneRequest, statesEvents);
            break;
          case 'Temperature':
            component = new TemperatureComponent(rawComponent, loxoneRequest, statesEvents);
            break;
          case 'Jalousie':
            component = new JalousieComponent(rawComponent, loxoneRequest, statesEvents);
            break;
          case 'Custom-OnOff':
            component = new CustomOnOff(rawComponent, loxoneRequest, statesEvents)
        }

        if (component != null) {
          this.components[component.id] = component;
        }
      })
  }

  getComponent(): { [key: string]: Component } {
    return this.components;
  }
}
