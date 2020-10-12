import { Observable, of, Subject } from 'rxjs/index';
import { map } from 'rxjs/internal/operators';
import { CapabilityHandler } from '../capabilities/capability-handler';
import { EndpointHealthHandler } from '../capabilities/endpoint-health';
import { OpenClose, OpenCloseAttributes, OpenCloseHandler } from '../capabilities/open-close';
import { ComponentRaw } from '../config';
import { ErrorType } from '../error';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';

export class OpenCloseSensorComponent extends Component implements OpenClose {
    protected statePos: number;
    protected stateUp: boolean;
    protected stateDown: boolean;

    constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        super(rawComponent, loxoneRequest, statesEvents);

        this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(jalousie => {
            this.loxoneRequest.watchComponent(jalousie['states']['numOpen']).subscribe(event => {
                // TODO Listen for open & send event
            });

            this.loxoneRequest.watchComponent(jalousie['states']['numClosed']).subscribe(event => {
                // TODO Listen for close & send event
            });
        });
    }

    getCapabilities(): CapabilityHandler<any>[] {
        return [
            OpenCloseHandler.INSTANCE,
            EndpointHealthHandler.INSTANCE,
        ];
    }

    open(): Observable<boolean> {
        if (this.stateUp || this.stateDown) {
            return this.stop();
        }

        return this.loxoneRequest.sendCmd(this.loxoneId, 'FullUp').pipe(map(result => {
            if (result.code === '200') {
                this.stateUp = true;
                this.statePos = 100;
                return true;
            }
            throw new Error(ErrorType.ENDPOINT_UNREACHABLE);
        }));
    }

    close(): Observable<boolean> {
        if (this.stateUp || this.stateDown) {
            return this.stop();
        }

        return this.loxoneRequest.sendCmd(this.loxoneId, 'FullDown').pipe(map(result => {
            if (result.code === '200') {
                this.stateDown = true;
                this.statePos = 0;
                return true;
            }
            throw new Error(ErrorType.ENDPOINT_UNREACHABLE);
        }));
    }

    getPosition(): Observable<number> {
        return of(this.statePos);
    }

    getOpenDirection(): Observable<string> {
        return of(this.stateUp ? 'UP' : 'DOWN');
    }

    getAttributes(): OpenCloseAttributes {
        return {
            discreteOnlyOpenClose: true,
            queryOnlyOpenClose: true,
        };
    }

    setPosition(percent: number): Observable<boolean> {
        if (this.stateUp || this.stateDown) {
            return this.stop();
        }

        return this.loxoneRequest.sendCmd(this.loxoneId, `ManualPosition/${percent}`).pipe(map(result => {
            if (result.code === '200') {
                return true;
            }
            throw new Error(ErrorType.ENDPOINT_UNREACHABLE);
        }));
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
