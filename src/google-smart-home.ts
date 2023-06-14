import { google } from 'googleapis';
import {
    SmartHomeV1ExecuteErrors,
    SmartHomeV1ExecuteRequestCommands,
    SmartHomeV1ExecuteRequestPayload,
    SmartHomeV1ExecuteResponse,
    SmartHomeV1ExecuteResponseCommands,
    SmartHomeV1ExecuteStatus,
    SmartHomeV1QueryRequestPayload,
    SmartHomeV1QueryResponse,
    SmartHomeV1SyncResponse
} from './smarthome/api.model';
import { Request } from 'express-serve-static-core';
import { from, interval, Observable, of } from 'rxjs';
import { buffer, catchError, filter, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { Auth0 } from './auth';
import { Handlers } from './capabilities/capability-handler';
import { Component } from './components/component';
import { ComponentsFactory } from './components/components.factory';
import { Config } from './config';

const uuid = require('uuid');

export class GoogleSmartHome {
    private readonly config: Config;
    private readonly jwtConfig: string;
    private readonly jwtPath: string;
    private readonly auth: Auth0;
    private readonly components: ComponentsFactory;
    private readonly statesEvents: Observable<Component>;
    private readonly handlers: Handlers;

    constructor(config: Config, components: ComponentsFactory, auth: Auth0, statesEvents: Observable<Component>, jwtConfig: string, jwtPath: string) {

        this.config = config;
        this.jwtConfig = jwtConfig;
        this.jwtPath = jwtPath;
        this.auth = auth;
        this.handlers = new Handlers();
        this.components = components;
        this.statesEvents = statesEvents;
    }

    init(): Observable<any> {
        // Wait for loxone autodetection before sync
        return this.components.init()
            .pipe(
                tap(async () => {
                    // Init Homegraph API
                    const auth = new google.auth.GoogleAuth({ keyFile: this.jwtPath, scopes: ['https://www.googleapis.com/auth/homegraph'] });
                    const client = await auth.getClient();
                    const homegraph = google.homegraph({ version: 'v1', auth: client });
                    if (!this.config.testMode) {
                        // Using this call synchronously seem fail (Err 500 from Google API).
                        await homegraph.devices.requestSync({ requestBody: { agentUserId: this.config.agentUserId, async: true } });
                    }

                    // Listening for loxone devices events
                    this.subscribeStates(this.statesEvents).subscribe({
                        next: (states) => homegraph.devices.reportStateAndNotification({ requestBody: states })
                    });
                })
            );
    }

    subscribeStates(statesEvents: Observable<Component>): Observable<any> {
        return statesEvents.pipe(
            buffer(interval(1000)),
            filter(componentsStates => componentsStates.length > 0),
            mergeMap(componentsStates => {
                return from(componentsStates).pipe(
                    mergeMap(component => component.getStates().pipe(map(state => {
                        const response = {};
                        response[component.id] = state;
                        return response
                    }))),
                    toArray(),
                    map(result => {
                        const states = result.reduce((acc, cur) => {
                            return Object.assign({}, acc, cur);
                        }, {});

                        return {
                            requestId: uuid.v4(),
                            agentUserId: this.config.agentUserId,
                            payload: {
                                devices: {
                                    states
                                }
                            }
                        }
                    }))
            })
        );
    }

    handler(data: any, request: Request): Observable<any> {
        const authToken = this.auth.checkToken(request);

        return authToken.pipe(
            mergeMap(registered => {
                if (!registered) {
                    return of({
                        errorCode: 'authFailure'
                    })
                }

                const input = data.inputs[0];
                const intent = input.intent;

                if (!intent) {
                    return of({
                        errorCode: 'notSupported'
                    })
                }

                switch (intent) {
                    case 'action.devices.SYNC':
                        console.log('post /smarthome SYNC');
                        return this.sync(data.requestId);
                    case 'action.devices.QUERY':
                        console.log('post /smarthome QUERY');
                        return this.query(input.payload, data.requestId);
                    case 'action.devices.EXECUTE':
                        console.log('post /smarthome EXECUTE');
                        return this.exec(input.payload, data.requestId);
                    case 'action.devices.DISCONNECT':
                        // TODO
                        return of({});
                    default:
                        return of({
                            errorCode: 'notSupported'
                        });
                }
            })
        );
    }

    sync(requestId: string): Observable<SmartHomeV1SyncResponse> {
        const devices = Object.values(this.components.getComponent())
            .map(component => component.getSync());
        console.log('start sync request');

        return of({
            requestId: requestId,
            payload: {
                agentUserId: this.config.agentUserId,
                devices: devices
            }
        });
    }

    // Retrieve states of multiple devices
    query(request: SmartHomeV1QueryRequestPayload, requestId: string): Observable<SmartHomeV1QueryResponse> {
        // We iterate trough devices
        return from(request.devices).pipe(
            mergeMap(device => {
                // Check if we have the device in factory
                if (!this.components.getComponent().hasOwnProperty(device.id)) {
                    return of({
                        id: device.id,
                        errorCode: 'deviceNotFound' as SmartHomeV1ExecuteErrors
                    }) as any;
                }

                return this.components.getComponent()[device.id].getStates().pipe(
                    map(states => {
                        return {
                            id: device.id,
                            states: states
                        } as any;
                    })
                );
            }),
            toArray(),
            map(result => {
                const devices = result.reduce((acc, cur) => {
                    if (cur['states']) {
                        acc[cur['id']] = cur['states'];
                    }
                    if (cur['errorCode']) {
                        acc[cur['id']] = {
                            'errorCode': cur['errorCode']
                        }
                    }
                    return acc;
                }, {});

                return {
                    requestId: requestId,
                    payload: {
                        devices: devices
                    }
                } as SmartHomeV1QueryResponse
            })
        );
    }

    exec(request: SmartHomeV1ExecuteRequestPayload, requestId: string): Observable<SmartHomeV1ExecuteResponse> {
        return from(request.commands).pipe(
            mergeMap(command => this.handleCommand(command)),
            toArray(),
            map((result: SmartHomeV1ExecuteResponseCommands[]) => {
                return {
                    requestId: requestId,
                    payload: {
                        commands: result
                    }
                }
            })
        )
    }

    handleCommand(command: SmartHomeV1ExecuteRequestCommands): Observable<SmartHomeV1ExecuteResponseCommands> {
        // Iterate trough devices
        return from(command.devices).pipe(
            mergeMap(device => {
                // Check if we have the device in factory
                if (!this.components.getComponent().hasOwnProperty(device.id)) {
                    return of({
                        ids: [device.id],
                        status: 'ERROR' as SmartHomeV1ExecuteStatus,
                        errorCode: 'deviceNotFound' as SmartHomeV1ExecuteErrors
                    } as SmartHomeV1ExecuteResponseCommands);
                }

                const component = this.components.getComponent()[device.id];
                if (this.config.log) {
                    console.log('Component found');
                }

                // Now execute all command into the device
                return from(command.execution).pipe(
                    mergeMap(execution => {
                        const componentHandler = this.handlers.getHandler(execution.command);

                        if (componentHandler === undefined) {
                            // If we can't found the device, return false
                            return of(false)
                        }

                        return componentHandler.handleCommands(component, execution.command, execution.params);
                    }),
                    catchError((err) => {
                        // TODO Make this better
                        console.error('ERROR', err);
                        return of(false);
                    }),
                    mergeMap((succeed: boolean) => {
                        // Can't find the handler, return not supported
                        if (!succeed) {
                            return of({
                                ids: [device.id],
                                status: 'ERROR' as SmartHomeV1ExecuteStatus,
                                errorCode: 'notSupported' as SmartHomeV1ExecuteErrors
                            } as SmartHomeV1ExecuteResponseCommands);
                        }

                        // Call state on component and merge them
                        return component.getStates().pipe(
                            map(states => {
                                return {
                                    ids: [device.id],
                                    status: 'SUCCESS' as SmartHomeV1ExecuteStatus,
                                    states: states
                                } as SmartHomeV1ExecuteResponseCommands;
                            })
                        );
                    })
                )
            })
        )
    }
}
