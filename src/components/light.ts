import { Observable, of, Subject } from 'rxjs/index';
import { map, tap } from 'rxjs/operators';
import { CapabilityHandler, Capability } from '../capabilities/capability-handler';
import { EndpointHealthHandler } from '../capabilities/endpoint-health';
import { OnOff, OnOffHandler } from '../capabilities/on-off';
import { ComponentRaw } from '../config';
import { ErrorType } from '../error';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';
import { BrightnessHandler, Brightness } from '../capabilities/brightness';

export class LightComponent extends Component implements OnOff, Brightness {
    private on: boolean;
    private brightness: number;

    constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        super(rawComponent, loxoneRequest, statesEvents);

        this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(light => {
            // TODO : Update brightness on change
            this.loxoneRequest.watchComponent(light['states']['active']).subscribe(event => {
                this.on = event === 1;
                this.statesEvents.next(this);
            })
        });
    }

    getCapabilities(): CapabilityHandler<any>[] {
        const capabilities: CapabilityHandler<any>[] = [
            OnOffHandler.INSTANCE,
            EndpointHealthHandler.INSTANCE,
        ];

        if(this.extendedOption && this.extendedOption.brigthness) {
            capabilities.push(BrightnessHandler.INSTANCE);
        }

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
