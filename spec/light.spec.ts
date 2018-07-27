import { Request } from 'express-serve-static-core';
import { Subject } from 'rxjs';
import { Auth0 } from '../src/auth';
import { Component } from '../src/components/component';
import { ComponentsFactory } from '../src/components/components.factory';
import { Config } from '../src/config';
import { GoogleSmartHome } from '../src/google-smart-home';
import { LoxoneRequest } from '../src/loxone-request';

const config = require('./support/config_test.json') as Config;
const jwtConfig = require('../jwt.json');

const statesEvents = new Subject<Component>();
const loxoneRequest = new LoxoneRequest(config);
const components = new ComponentsFactory(config, loxoneRequest, statesEvents);

beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
});

describe('OnOff', () => {
    it('should be online', (done: DoneFn) => {

        const firstComponentInConfig = config.components[0];

        const request = {
            headers: {
                authorization: 'Bearer access-token-from-skill',
            },
            body: {
                'requestId': 'ff36a3cc-light-1',
                'inputs': [{
                    'intent': 'action.devices.QUERY',
                    'payload': {
                        'devices': [{
                            'id': firstComponentInConfig.id
                        }]
                    }
                }]
            }
        } as any;
        const data = request.body;

        const smartHome = new GoogleSmartHome(config, components, new Auth0(config), statesEvents, jwtConfig); ;

        smartHome.handler(data, request).subscribe((result) => {
            expect(result.payload.devices[firstComponentInConfig.id].online).toBeTruthy();
            done();
        })
    });

    it('should turn on', (done: DoneFn) => {

        const firstComponentInConfig = config.components[0];

        const request = {
            headers: {
                authorization: 'Bearer access-token-from-skill',
            },
            body: {
                'requestId': 'ff36a3cc-light-2',
                'inputs': [{
                    'intent': 'action.devices.EXECUTE',
                    'payload': {
                        'commands': [{
                            'devices': [{
                                'id': firstComponentInConfig.id,
                            }],
                            'execution': [{
                                'command': 'action.devices.commands.OnOff',
                                'params': {
                                    'on': true
                                }
                            }]
                        }]
                    }
                }]
            }
        } as any;
        const data = request.body;

        const smartHome = new GoogleSmartHome(config, components, new Auth0(config), statesEvents, jwtConfig); ;

        smartHome.handler(data, request).subscribe((result) => {
            console.log(JSON.stringify(result));
            // TODO https://developers.google.com/actions/smarthome/traits/onoff#response
            done();
        })
    });

    it('should turn off', (done: DoneFn) => {

        const firstComponentInConfig = config.components[0];

        const request = {
            headers: {
                authorization: 'Bearer access-token-from-skill',
            },
            body: {
                'requestId': 'ff36a3cc-light-2',
                'inputs': [{
                    'intent': 'action.devices.EXECUTE',
                    'payload': {
                        'commands': [{
                            'devices': [{
                                'id': firstComponentInConfig.id,
                            }],
                            'execution': [{
                                'command': 'action.devices.commands.OnOff',
                                'params': {
                                    'on': false
                                }
                            }]
                        }]
                    }
                }]
            }
        } as any;
        const data = request.body;

        const smartHome = new GoogleSmartHome(config, components, new Auth0(config), statesEvents, jwtConfig); ;

        smartHome.handler(data, request).subscribe((result) => {
            console.log(JSON.stringify(result));
            // TODO https://developers.google.com/actions/smarthome/traits/onoff#response
            done();
        })
    });
});
