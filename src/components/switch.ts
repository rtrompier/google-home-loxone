import { Observable, of, Subject } from 'rxjs/index';
import { map } from 'rxjs/operators';
import { Brightness, BrightnessHandler } from '../capabilities/brightness';
import { CapabilityHandler } from '../capabilities/capability-handler';
import { EndpointHealthHandler } from '../capabilities/endpoint-health';
import { OnOff, OnOffHandler } from '../capabilities/on-off';
import { ComponentRaw } from '../config';
import { ErrorType } from '../error';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';

export class SwitchComponent extends Component implements OnOff {
    private on: boolean;

    constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        super(rawComponent, loxoneRequest, statesEvents);

        this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(light => {
            // Subscribe on active status update of the current switch
            this.loxoneRequest.watchComponent(light.states.active).subscribe((event) => {
                this.on = event === 1 ? true : false;
                this.statesEvents.next(this);
            });
        });
    }

    getCapabilities(): CapabilityHandler<any>[] {
        const capabilities: CapabilityHandler<any>[] = [
            OnOffHandler.INSTANCE,
            EndpointHealthHandler.INSTANCE,
        ];

        return capabilities;
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
            throw new Error(ErrorType.ENDPOINT_UNREACHABLE)
        }))
    }

    getPowerState(): Observable<any> {
        return of(this.on);
    }
}
