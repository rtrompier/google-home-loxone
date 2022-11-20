import { Axios } from 'axios-observable';
import nock from 'nock';
import { map } from 'rxjs/operators';
import { Server } from '../src/server';

const config = require('./support/config_test.json');
const loxoneDiscoverResponse = require('./responses/loxone-discover.json');
let app;

describe('Light', () => {
    beforeAll((done: DoneFn) => {
        const url = `http://${config.loxone.url}`;

        nock(url)
            .post('/data/LoxApp3.json')
            .reply(200, loxoneDiscoverResponse);

        app = new Server({
            jwt: __dirname + '/support/jwt.json',
            config: __dirname + '/support/config_test.json',
            port: 3000,
        }, done);
    });

    afterAll((done) => {
        app?.server?.close(done);
    });

    it('should request the status of a light', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.QUERY',
                payload: {
                    devices: [
                        {
                            id: '10f4ff00-0155-692f-ffff6322d0f91668'
                        }
                    ]
                }
            }]
        }, {
            headers: {
                Authorization: 'Bearer access-token-from-skill',
            }
        })
            .pipe(map((resp: any) => resp.data))
            .subscribe((resp) => {
                expect(resp.payload.devices['10f4ff00-0155-692f-ffff6322d0f91668'].online).toBeTruthy();
                // TODO : Test status on / off
                done();
            });
    });

    it('should turn on a light', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.EXECUTE',
                payload: {
                    commands: [{
                        devices: [{
                            id: '10f4ff00-0155-692f-ffff6322d0f91668'
                        }],
                        execution: [{
                            command: 'action.devices.commands.OnOff',
                            params: {
                                on: true
                            }
                        }]
                    }]
                }
            }]
        }, {
            headers: {
                Authorization: 'Bearer access-token-from-skill',
            }
        })
            .pipe(map((resp: any) => resp.data))
            .subscribe((resp) => {
                expect(resp.payload.commands[0].states.online).toBeTruthy();
                expect(resp.payload.commands[0].states.on).toBeTruthy();
                done();
            });
    });

    it('should turn off a light', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.EXECUTE',
                payload: {
                    commands: [{
                        devices: [{
                            id: '10f4ff00-0155-692f-ffff6322d0f91668'
                        }],
                        execution: [{
                            command: 'action.devices.commands.OnOff',
                            params: {
                                on: false
                            }
                        }]
                    }]
                }
            }]
        }, {
            headers: {
                Authorization: 'Bearer access-token-from-skill',
            }
        })
            .pipe(map((resp: any) => resp.data))
            .subscribe((resp) => {
                expect(resp.payload.commands[0].states.online).toBeTruthy();
                expect(resp.payload.commands[0].states.on).toBeFalse();
                done();
            });
    });

    it('should turn on a light with brigthness', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.EXECUTE',
                payload: {
                    commands: [{
                        devices: [{
                            id: '10f4ff00-0155-692f-ffff6322d0f91668'
                        }],
                        execution: [{
                            command: 'action.devices.commands.BrightnessAbsolute',
                            params: {
                                brightness: 60
                            }
                        }]
                    }]
                }
            }]
        }, {
            headers: {
                Authorization: 'Bearer access-token-from-skill',
            }
        })
            .pipe(map((resp: any) => resp.data))
            .subscribe((resp) => {
                expect(resp.payload.commands[0].states.online).toBeTruthy();
                expect(resp.payload.commands[0].states.brightness).toEqual(60);
                done();
            });
    });
});
