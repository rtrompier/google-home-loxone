import { Axios } from 'axios-observable';
import nock from 'nock';
import { map } from 'rxjs/operators';
import { Server } from '../src/server';

const config = require('./support/config_test.json');
const loxoneDiscoverResponse = require('./responses/loxone-discover.json');
let app;

describe('Air Conditionner', () => {
    beforeAll((done: DoneFn) => {
        const url = `${config.loxone.protocol}://${config.loxone.url}`;

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

    it('should request the status of a temperature', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.QUERY',
                payload: {
                    devices: [
                        {
                            id: '10f4ff00-0155-692f-ffff6322d0f91670'
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
                expect(resp.payload.devices['10f4ff00-0155-692f-ffff6322d0f91670'].online).toBeTruthy();
                // TODO : Test status
                done();
            });
    });

    // TODO : Mock Loxone Socket 
    // it('should update the target temperature', (done: DoneFn) => {
    //     Axios.post(`http://localhost:3000/smarthome`, {
    //         requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    //         inputs: [{
    //             intent: 'action.devices.QUERY',
    //             payload: {
    //                 "commands": [{
    //                     "devices": [{
    //                         "id": "1b70c016-0396-1f6d-ffff0be037a23d47"
    //                     }],
    //                     "execution": [{
    //                         "command": "action.devices.commands.ThermostatTemperatureSetpoint",
    //                         "params": {
    //                             "thermostatTemperatureSetpoint": 24
    //                         }
    //                     }]
    //                 }]
    //             }
    //         }]
    //     }, {
    //         headers: {
    //             Authorization: 'Bearer access-token-from-skill',
    //         }
    //     })
    //         .pipe(map((resp: any) => resp.data))
    //         .subscribe((resp) => {
    //             expect(resp.payload.devices['10f4ff00-0155-692f-ffff6322d0f91670'].online).toBeTruthy();
    //             expect(resp.payload.devices['10f4ff00-0155-692f-ffff6322d0f91670'].thermostatTemperatureSetpoint).toBe('24');
    //             // TODO : Test status
    //             done();
    //         });
    // });

});


