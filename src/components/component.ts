import { Observable, of, Subject, from } from 'rxjs';
import { map, mergeMap, toArray } from 'rxjs/operators';
import { CapabilityHandler } from '../capabilities/capability-handler';
import { EndpointHealth, EndpointHealthHandler } from '../capabilities/endpoint-health';
import { ComponentRaw } from '../config';
import { LoxoneRequest } from '../loxone-request';


export abstract class Component implements EndpointHealth {
    protected readonly loxoneRequest: LoxoneRequest;

    public readonly id: string;
    public readonly loxoneId: string;
    public readonly name: string;
    public readonly type: string;
    public readonly room: string;
    protected readonly statesEvents: Subject<Component>;

    protected constructor(rawComponent: ComponentRaw, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        this.loxoneRequest = loxoneRequest;
        this.id = rawComponent.id;
        this.name = rawComponent.name;
        this.type = rawComponent.type;
        this.room = rawComponent.room;
        this.loxoneId = rawComponent.id;
        this.statesEvents = statesEvents;
    }

    public abstract getCapabilities(): CapabilityHandler<any>[];

    getStates(): Observable<any> {
        const capabilities = this.getCapabilities();
        capabilities.push(EndpointHealthHandler.INSTANCE);

        return from(capabilities).pipe(
            mergeMap(handler => {
                return handler.getState(this)
            }),
            toArray(),
            map(result => {
                // We merge all statesEvents into one object
                return result.reduce((acc, cur) => {
                    return Object.assign({}, acc, cur);
                }, {});
            })
        )
    }

    getSync(): any {
        const capabilities = this.getCapabilities()
            .map(handler => handler.getTrait())
            .filter(trait => trait !== null);

        const attributes = this.getCapabilities()
            .map(handler => handler.getAttributes(this))
            .reduce((acc, cur) => {
                return Object.assign({}, acc, cur);
            }, {});

        return {
            'id': this.id,
            'name': {
                'name': this.name,
                'defaultNames': [this.name],
                'nicknames': [this.name]
            },
            'roomHint': this.room,
            'willReportState': true,
            'type': 'action.devices.types.' + this.type,
            'traits': capabilities,
            'attributes': attributes
        }
    }

    getHealthCheck(): Observable<any> {
        return of({
            'online': true
        })
    }
}
