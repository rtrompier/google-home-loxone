import * as bodyParser from 'body-parser';
import express, {Express} from 'express';
import {Request, Response} from 'express-serve-static-core';
import {Subject} from 'rxjs/internal/Subject';
import {Auth0} from './auth';
import {Component} from './components/component';
import {ComponentsFactory} from './components/components.factory';
import {Config} from './config';
import {GoogleSmartHome} from './google-smart-home';
import {LoxoneRequest} from './loxone-request';

const ngrok = require('ngrok');

// Serve the application at the given port
const config = require('../config.json') as Config;
const jwtConfig = require('../jwt.json');

class Server {
  public app: Express;
  private smartHome: GoogleSmartHome;

  static bootstrap() {
    return new Server();
  }

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    const statesEvents = new Subject<Component>();
    const loxoneRequest = new LoxoneRequest(config);
    const components = new ComponentsFactory(config, loxoneRequest, statesEvents);
    this.smartHome = new GoogleSmartHome(config, components, new Auth0(config), statesEvents, jwtConfig);
  }

  config() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(function (err, req, res, next) {
      err.status = 404;
      next(err);
    });
  }

  routes() {
    const router = express.Router();
    router.post('/smarthome', (request: Request, response: Response) => {
      const data = request.body;

      this.smartHome.handler(data, request).subscribe(result => {
        console.log(JSON.stringify(result));
        response.status(200).set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }).json(result);
      })
    });
    this.app.use(router);
  }
}

const server = Server.bootstrap().app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Smart Home Cloud and App listening at %s:%s', host, port);
});

