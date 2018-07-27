import {Observable} from 'rxjs/internal/Observable';
import {EndpointHealthHandler} from './endpoint-health';
import {OnOffHandler} from './on-off';
import {TemperatureControlHandler} from './temperature-control';
import { BrightnessHandler } from './brightness';

/* tslint:disable no-empty-interface */
export interface Capability {
}

export interface CapabilityHandler<T extends Capability> {
  getCommands(): string[]

  getTrait(): string;

  getAttributes(component: T): any;

  getState(component: T): Observable<any>;

  handleCommands(component: T, command: string, params?: any): Observable<boolean>;
}

export class Handlers {
  private handlers: CapabilityHandler<any>[];
  private internalDict: { [key: string]: CapabilityHandler<any> } = {};

  constructor() {
    this.handlers = [
      OnOffHandler.INSTANCE,
      BrightnessHandler.INSTANCE,
      EndpointHealthHandler.INSTANCE,
      TemperatureControlHandler.INSTANCE
    ];

    this.handlers.forEach(handler => {
      handler.getCommands().forEach(command => {
        this.internalDict[command] = handler;
      })
    })
  }

  getHandler(command: string) {
    return this.internalDict[command];
  }
}
