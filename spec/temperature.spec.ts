import { Axios } from 'axios-observable';
import nock from 'nock';
import { map } from 'rxjs/operators';
import { Server } from '../src/server';

const config = require('./support/config_test.json');
const loxoneDiscoverResponse = require('./responses/loxone-discover.json');
let app;

describe('Temperature', () => {
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

    it('should request the status of a temperature', (done: DoneFn) => {
        Axios.post(`http://localhost:3000/smarthome`, {
            requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
            inputs: [{
                intent: 'action.devices.QUERY',
                payload: {
                    devices: [
                        {
                            id: '12120c85-004b-4d55-fffffdd4e0772c8f'
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
                expect(resp.payload.devices['12120c85-004b-4d55-fffffdd4e0772c8f'].online).toBeTruthy();
                // TODO : Test status
                done();
            });
    });

});
