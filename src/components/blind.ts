import { Observable, of, Subject } from 'rxjs/index';
import { map } from 'rxjs/internal/operators';
import { CapabilityHandler } from '../capabilities/capability-handler';
import { EndpointHealthHandler } from '../capabilities/endpoint-health';
import { OpenClose, OpenCloseHandler } from '../capabilities/open-close';
import { ComponentRaw } from '../config';
import { ErrorType } from '../error';
import { LoxoneRequest } from '../loxone-request';
import { Component } from './component';

export class BlindComponent extends Component implements OpenClose {
    protected askedPos: number;
    protected statePos: number;
    protected stateUp: boolean;
    protected stateDown: boolean;

    constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        super(rawComponent, loxoneRequest, statesEvents);

        this.loxoneRequest.getControlInformation(this.loxoneId).subscribe(jalousie => {
            this.loxoneRequest.watchComponent(jalousie['states']['position']).subscribe(event => {
                this.statePos = (1 - event) * 100;

                // Loxone doesn't allow to set the blind position
                // Listen the current position and stop manually the blind if needed
                if (this.askedPos) {
                    if (this.stateUp && this.statePos > this.askedPos) {
                        this.askedPos = null;
                        this.stop().subscribe();
                    }
                    if (this.stateDown && this.statePos < this.askedPos) {
                        this.askedPos = null;
                        this.stop().subscribe();
                    }
                }
            });

            this.loxoneRequest.watchComponent(jalousie['states']['up']).subscribe(event => {
                this.stateUp = event;
            });

            this.loxoneRequest.watchComponent(jalousie['states']['down']).subscribe(event => {
                this.stateDown = event;
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

        return this.loxoneRequest.sendCmd(this.loxoneId, 'up').pipe(map(result => {
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

        return this.loxoneRequest.sendCmd(this.loxoneId, 'down').pipe(map(result => {
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

    setPosition(percent: number): Observable<boolean> {
        if (this.stateUp || this.stateDown) {
            return this.stop();
        }

        this.askedPos = percent;
        const dir = this.askedPos > this.statePos ? 'up' : 'down';
        return this.loxoneRequest.sendCmd(this.loxoneId, dir).pipe(map(result => {
            if (result.code === '200') {
                this.statePos = percent;
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
