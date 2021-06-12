import * as bodyParser from 'body-parser';
import express, { Express } from 'express';
import { Request, Response } from 'express-serve-static-core';
import { readFileSync } from 'fs';
import { Observable } from 'rxjs';
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
    public server: any;
    private smartHome: GoogleSmartHome;
    private notifier: Notifier;
    private weather: Weather;

    private readonly config: Config;
    private readonly jwtPath: string;
    private readonly jwtConfig: string;

    constructor(argv: any, callback?: () => any) {
        this.jwtPath = argv.jwt;
        this.jwtConfig = JSON.parse(readFileSync(argv.jwt, 'utf-8'));
        this.config = JSON.parse(readFileSync(argv.config, 'utf-8'));
        this.config.serverPort = argv.port;
        if (argv.verbose) {
            this.config.log = true;
        }

        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use((err, req, res, next) => {
            err.status = 404;
            next(err);
        });

        const statesEvents = new Subject<Component>();
        const loxoneRequest = new LoxoneRequest(this.config);
        const components = new ComponentsFactory(this.config, loxoneRequest, statesEvents);
        this.smartHome = new GoogleSmartHome(this.config, components, new Auth0(this.config), statesEvents, this.jwtConfig, this.jwtPath);
        this.notifier = new Notifier(this.config);
        this.weather = new Weather(this.config);

        this.routes();
        this.init(argv.port).subscribe(() => {
            console.log('Server initialized');
            if (callback) {
                callback();
            }
        });
    }

    init(port): Observable<any> {
        return new Observable((subscriber) => {
            this.server = this.app.listen(port, () => {
                console.log('Smart Home Cloud and App listening at %s:%s', `http://localhost`, port);
                this.smartHome.init().subscribe(() => {
                    console.log('init sucessfull');
                    subscriber.next();
                    subscriber.complete();
                }, (err) => {
                    console.error('Error while init', err);
                    subscriber.error(err);
                    subscriber.complete();
                })
            })

        })
    }

    routes() {
        const router = express.Router();

        router.post('/smarthome', (request: Request, response: Response) => {
            const data = request.body;

            if (this.config.log) {
                console.log('Smarthome request received', JSON.stringify(data, null, 4));
            }

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

        router.get('/speech/stream', (request: Request, response: Response) => {
            this.notifier.streamHandler(request).subscribe((stream) => {
                response.writeHead(200, {
                    'Content-Type': 'audio/mpeg',
                    'Transfer-Encoding': 'chunked'
                });
                stream.pipe(response);
            }, (error) => {
                response.status(500).json({ error: error });
            });
        });

        this.weather.initWeatherRouter(router);

        this.app.use(router);
    }
}
