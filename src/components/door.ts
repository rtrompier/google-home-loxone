import {Observable, of, Subject} from 'rxjs/index';
import {map} from 'rxjs/internal/operators';
import {CapabilityHandler} from '../capabilities/capability-handler';
import {OnOff, OnOffHandler} from '../capabilities/on-off';
import {ComponentRaw} from '../config';
import {LoxoneRequest} from '../loxone-request';
import {Component} from './component';

/**
 * For now, door is create the time for lock to be activated
 */
export class DoorComponent extends Component implements OnOff {
  private active: boolean;
  private statePos: number;

  constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
    super(rawComponent, loxoneRequest, statesEvents);

    this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(door => {
      this.loxoneRequest.watchComponent(door['states']['position']).subscribe(event => {
        this.statePos = event;
      });

      this.loxoneRequest.watchComponent(door['states']['active']).subscribe(event => {
        this.active = event;
      });
    });
  }

  getCapabilities(): CapabilityHandler<any>[] {
    return [
      OnOffHandler.INSTANCE
    ];
  }

  turnOn(): Observable<boolean> {
    if (this.active) {
      return this.stop();
    }

    return this.loxoneRequest.sendCmd(this.loxoneId, 'open').pipe(map(result => {
      if (result.code === '200') {
        this.active = true;
        return true;
      }
    }));
  }

  turnOff(): Observable<boolean> {
    if (this.active) {
      return this.stop();
    }

    return this.loxoneRequest.sendCmd(this.loxoneId, 'close').pipe(map(result => {
      if (result.code === '200') {
        this.active = true;
        return true;
      }
    }));
  }

  getPowerState(): Observable<boolean> {
    return of(this.statePos > 0)
  }

  stop(): Observable<boolean> {
    return this.loxoneRequest.sendCmd(this.loxoneId, 'stop').pipe(map(result => {
        if (result.code === '200') {
          this.active = false;
          return true;
        }
      })
    )
  }
}
