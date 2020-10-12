import * as bodyParser from 'body-parser';
import express, { Express } from 'express';
import { Request, Response } from 'express-serve-static-core';
import { readFileSync } from 'fs';
import { Subject } from 'rxjs/internal/Subject';
import { Auth0 } from './auth';
import { Component } from './components/component';
import { ComponentsFactory } from './components/components.factory';
import { Config } from './config';
import { GoogleSmartHome } from './google-smart-home';
import { LoxoneRequest } from './loxone-request';
import { Notifier } from './notifier/notifier';
import { Weather } from './weather/weather';

export class Server {
    public app: Express;
    private smartHome: GoogleSmartHome;
    private notifier: Notifier;
    private weather: Weather;

    private readonly config: Config;
    private readonly jwtConfig: Config;

    constructor(argv: any) {
        this.jwtConfig = JSON.parse(readFileSync(argv.jwt, 'utf-8'));
        this.config = JSON.parse(readFileSync(argv.config, 'utf-8'));
        if (argv.verbose) {
            this.config.log = true;
        }

        this.app = express();
        this.init(argv.port);

        const statesEvents = new Subject<Component>();
        const loxoneRequest = new LoxoneRequest(this.config);
        const components = new ComponentsFactory(this.config, loxoneRequest, statesEvents);
        this.smartHome = new GoogleSmartHome(this.config, components, new Auth0(this.config), statesEvents, this.jwtConfig);
        this.notifier = new Notifier(this.config);
        this.weather = new Weather(this.config);

        this.routes();
    }

    init(port) {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use((err, req, res, next) => {
            err.status = 404;
            next(err);
        });
        this.app.listen(port, () => {
            console.log('Smart Home Cloud and App listening at %s:%s', `http://localhost`, port);
        })
    }

    routes() {
        const router = express.Router();

        router.post('/smarthome', (request: Request, response: Response) => {
            const data = request.body;

            this.smartHome.handler(data, request).subscribe(result => {
                if (this.config.log) {
                    console.log('Response sent to Google', JSON.stringify(result));
                }
                response.status(200).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }).json(result);
            })
        });

        router.get('/speech', (request: Request, response: Response) => {
            this.notifier.handler(request).subscribe((result) => {
                response.status(200).json(result);
            }, (error) => {
                response.status(500).json({ error: error });
            });
        });

        this.weather.initWeatherRouter(router);

        this.app.use(router);
    }
}
