import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brightness, BrightnessHandler } from '../capabilities/brightness';
import { CapabilityHandler } from '../capabilities/capability-handler';
import { EndpointHealthHandler } from '../capabilities/endpoint-health';
import { OnOff, OnOffHandler } from '../capabilities/on-off';
import { ComponentRaw } from '../config';
import { ErrorType } from '../error';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';

export class LightComponent extends Component implements OnOff, Brightness {
    private on: boolean;
    private brightness: number;

    constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        super(rawComponent, loxoneRequest, statesEvents);

        this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(light => {
            Object.keys(light.states).forEach((prop) => {
                // Subscribe on each status update of the current light
                this.loxoneRequest.watchComponent(light.states[prop]).subscribe((event) => {
                    switch (prop) {
                        case 'active':
                            this.on = event === 1 ? true : false;
                            this.statesEvents.next(this);
                            break;
                        case 'position':
                            this.brightness = event;
                            this.statesEvents.next(this);
                    }
                });
            });
        });
    }

    getCapabilities(): CapabilityHandler<any>[] {
        return [
            OnOffHandler.INSTANCE,
            BrightnessHandler.INSTANCE,
            EndpointHealthHandler.INSTANCE
        ];
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

    setBrightness(val) {
        return this.loxoneRequest.sendCmd(this.loxoneId, val).pipe(map((result) => {
            if (result.code === '200') {
                this.brightness = val;
                this.statesEvents.next(this);
                return true;
            }
            throw new Error(ErrorType.ENDPOINT_UNREACHABLE)
        }))
    }

    getPowerState(): Observable<any> {
        return of(this.on);
    }

    getBrightnessState(): Observable<any> {
        return of(this.brightness);
    }
}
