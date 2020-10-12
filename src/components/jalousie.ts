import {Observable, of, Subject} from 'rxjs/index';
import {map} from 'rxjs/internal/operators';
import {CapabilityHandler} from '../capabilities/capability-handler';
import {EndpointHealthHandler} from '../capabilities/endpoint-health';
import {OnOff, OnOffHandler} from '../capabilities/on-off';
import {ComponentRaw} from '../config';
import {LoxoneRequest} from '../loxone-request';
import {Component} from './component';

export class JalousieComponent extends Component implements OnOff {
  protected statePos: number;
  protected stateUp: boolean;
  protected stateDown: boolean;

  constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    super(rawComponent, loxoneRequest, statesEvents);

    this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(jalousie => {
      this.loxoneRequest.watchComponent(jalousie.states.position).subscribe(event => {
        this.statePos = event;
      });

      this.loxoneRequest.watchComponent(jalousie.states.up).subscribe(event => {
        this.stateUp = event;
      });

      this.loxoneRequest.watchComponent(jalousie.states.down).subscribe(event => {
        this.stateDown = event;
      });
    });
  }

  getCapabilities(): CapabilityHandler<any>[] {
    return [
      OnOffHandler.INSTANCE,
      EndpointHealthHandler.INSTANCE,
    ];
  }

  turnOn(): Observable<boolean> {
    if (this.stateUp || this.stateDown) {
      return this.stop();
    }

    return this.loxoneRequest.sendCmd(this.loxoneId, 'up').pipe(map(result => {
      if (result.code === '200') {
        this.stateUp = true;
        return true;
      }
    }));
  }

  turnOff(): Observable<boolean> {
    if (this.stateUp || this.stateDown) {
      return this.stop();
    }

    return this.loxoneRequest.sendCmd(this.loxoneId, 'down').pipe(map(result => {
      if (result.code === '200') {
        this.stateDown = true;
        return true;
      }
    }));
  }

  getPowerState(): Observable<boolean> {
    return of(this.statePos > 0)
  }

  protected stop(): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, 'stop').pipe(map(result => {
      if (result.code === '200') {
        this.stateDown = false;
        this.stateUp = false;
        return true;
      }
    }))
  }
}
