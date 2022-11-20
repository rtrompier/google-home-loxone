import { Axios } from 'axios-observable';
import nock from 'nock';
import { map } from 'rxjs/operators';
import { Server } from '../src/server';

const config = require('./support/config_test.json');
const loxoneDiscoverResponse = require('./responses/loxone-discover.json');
let app;

describe('Jalousie', () => {
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

    it('should request the status of a jalousie', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.QUERY',
                payload: {
                    devices: [
                        {
                            id: '11f4e162-010a-457d-ffff0be037a23d47'
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
                expect(resp.payload.devices['11f4e162-010a-457d-ffff0be037a23d47'].online).toBeTruthy();
                done();
            });
    });

    it('should open a jalousie', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.EXECUTE',
                payload: {
                    commands: [{
                        devices: [{
                            id: '11f4e162-010a-457d-ffff0be037a23d47'
                        }],
                        execution: [{
                            command: 'action.devices.commands.OpenClose',
                            params: {
                                openPercent: 100
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
                expect(resp.payload.commands[0].states.openState[0].openPercent).toEqual(100);
                expect(resp.payload.commands[0].states.openState[0].openDirection).toEqual('UP');
                done();
            });
    });

    it('should close a jalousie', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.EXECUTE',
                payload: {
                    commands: [{
                        devices: [{
                            id: '11f4e162-010a-457d-ffff0be037a23d47'
                        }],
                        execution: [{
                            command: 'action.devices.commands.OpenClose',
                            params: {
                                openPercent: 0
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
                expect(resp.payload.commands[0].states.openState[0].openPercent).toEqual(0);
                expect(resp.payload.commands[0].states.openState[0].openDirection).toEqual('DOWN');
                done();
            });
    });

});
