import { Request, Response, Router } from 'express-serve-static-core';
import { Observable } from 'rxjs';
import { Config } from '../config';
import { NetatmoApi } from './netatmo-api';

export class Weather {
    private readonly config: Config;
    private readonly netatmo: NetatmoApi;

    constructor(config: Config) {
        this.config = config;
        this.netatmo = new NetatmoApi(config);
    }

    public initWeatherRouter(router: Router): Router {
        router.get('/weather', (request: Request, response: Response) => {
            this.getWeather(request).subscribe((result) => {
                response.status(200).json(result);
            });
        });

        return router;
    }

    private getWeather(request: Request): Observable<any> {
        if (this.config.log) {
            console.log(`Weather request received`);
        }
        return this.netatmo.getWeather();
    }

}
