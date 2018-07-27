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

beforeEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
});

describe('Brightness', () => {
    it('should set brightness to 65%', (done: DoneFn) => {

        const componentInConfig = config.components[1];

        const request = {
            headers: {
                authorization: 'Bearer access-token-from-skill',
            },
            body: {
                'requestId': 'ff36a3cc-brightness-1',
                'inputs': [{
                    'intent': 'action.devices.EXECUTE',
                    'payload': {
                        'commands': [{
                            'devices': [{
                                'id': componentInConfig.id,
                            }],
                            'execution': [{
                                'command': 'action.devices.commands.BrightnessAbsolute',
                                'params': {
                                    'brightness': 65
                                }
                            }]
                        }]
                    }
                }]
            }
        } as any;
        const data = request.body;

        const smartHome = new GoogleSmartHome(config, components, new Auth0(config), statesEvents, jwtConfig);;

        smartHome.handler(data, request).subscribe((result) => {
            console.log('RESP', JSON.stringify(result));
            // TODO https://developers.google.com/actions/smarthome/traits/onoff#response
            done();
        })
    });

});
