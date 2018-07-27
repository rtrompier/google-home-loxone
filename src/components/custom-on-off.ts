import {Observable, of, Subject} from 'rxjs/index';
import {map} from 'rxjs/internal/operators';
import {CapabilityHandler} from '../capabilities/capability-handler';
import {OnOff, OnOffHandler} from '../capabilities/on-off';
import {ComponentRaw} from '../config';
import {LoxoneRequest} from '../loxone-request';
import {Component} from './component';

export class CustomOnOff extends Component implements OnOff {
  private onAction: string;
  private offAction: string;

  constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    super(rawComponent, loxoneRequest, statesEvents);

    this.onAction = rawComponent.customData['on'];
    this.offAction = rawComponent.customData['off'];
  }

  getCapabilities(): CapabilityHandler<any>[] {
    return [
      OnOffHandler.INSTANCE
    ];
  }

  turnOn(): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, this.onAction).pipe(map(result => {
      if (result.code === '200') {
        return true;
      }
    }));
  }

  turnOff(): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, this.offAction).pipe(map(result => {
      if (result.code === '200') {
        return true;
      }
    }));
  }

  getPowerState(): Observable<boolean> {
    return of(true);
  }
}
