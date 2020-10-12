import { RxHR } from '@akanass/rx-http-request';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/operators';
import { ComponentRaw, Config } from '../config';
import { LoxoneRequest } from '../loxone-request';
import { BlindComponent } from './blind';
import { Component } from './component';
import { LightComponent } from './light';
import { OpenCloseSensorComponent } from './openclose-sensor';
import { SwitchComponent } from './switch';
import { TemperatureComponent } from './temperature';

export class ComponentsFactory {
    private components: { [key: string]: Component } = {};
    private config: Config;
    private loxoneRequest: LoxoneRequest;
    private statesEvents: Subject<Component>;

    constructor(config: Config, loxoneRequest: LoxoneRequest, statesEvents: Subject<Component>) {
        this.config = config;
        this.loxoneRequest = loxoneRequest;
        this.statesEvents = statesEvents;
    }

    init(): Observable<{ [key: string]: Component }> {
        return RxHR.post(`http://${this.config.loxone.user}:${this.config.loxone.password}@${this.config.loxone.url}/data/LoxApp3.json`, {
            json: true
        }).pipe(
            map((resp: any) => {
                const body = resp.body;
                for (const controlId in body.controls) {
                    const roomId = body?.controls[controlId]?.room;
                    const rawComponent: ComponentRaw = {
                        id: controlId,
                        loxoneType: body.controls[controlId].type,
                        name: body.controls[controlId].name,
                        room: roomId ? body.rooms[roomId].name : 'Unknow',
                        type: this.extractType(body.controls[controlId].type),
                    };

                    let component: Component;
                    switch (rawComponent.loxoneType) {
                        // case 'Switch':
                        //     component = new SwitchComponent(rawComponent, this.loxoneRequest, this.statesEvents);
                        //     break;
                        // case 'EIBDimmer':
                        //     component = new LightComponent(rawComponent, this.loxoneRequest, this.statesEvents);
                        //     break;
                        // case 'Jalousie':
                        //     component = new BlindComponent(rawComponent, this.loxoneRequest, this.statesEvents);
                        //     break;
                        case 'IRoomControllerV2':
                            component = new TemperatureComponent(rawComponent, this.loxoneRequest, this.statesEvents);
                            break;
                        // case 'WindowMonitor':
                        //     component = new OpenCloseSensorComponent(rawComponent, this.loxoneRequest, this.statesEvents);
                        //     break;

                        // case 'Door':
                        //     component = new DoorComponent(rawComponent, loxoneRequest, statesEvents);
                        //     break;
                        // case 'Pool':
                        //     component = new PoolComponent(rawComponent, loxoneRequest, statesEvents);
                        //     break;
                        default:
                        // console.log(`Type [${rawComponent.loxoneType}] not yet supported`);
                    }

                    if (component != null) {
                        this.components[component.id] = component;
                    }

                }

                return this.components;
            })
        );
    }

    getComponent(): { [key: string]: Component } {
        return this.components;
    }

    private extractType(loxoneType: string): 'LIGHT' | 'THERMOSTAT' | 'BLINDS' | 'SWITCH' | 'SENSOR' {
        switch (loxoneType) {
            case 'Switch':
                return 'SWITCH';
            case 'EIBDimmer':
                return 'LIGHT';
            case 'Jalousie':
                return 'BLINDS';
            case 'IRoomControllerV2':
                return 'THERMOSTAT';
            case 'WindowMonitor':
                return 'SENSOR';
        }
    }
}
