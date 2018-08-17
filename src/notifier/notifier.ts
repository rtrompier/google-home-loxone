import { Request } from 'express-serve-static-core';
import * as GoogleHome from 'node-googlehome';
import { from, Observable, throwError } from 'rxjs';
import { Config } from '../config';
import { NotifierService } from './notifier-service.model';

export class Notifier {
    private readonly config: Config;
    private devices: NotifierService[] = [];

    constructor(config: Config) {
        this.config = config;
        this.devices = config.notifier.devices;
    }

    public handler(request: Request): Observable<any> {
        const deviceName = request.query.device;
        const text = request.query.text;

        const device = this.devices.find((dev) => dev.name === deviceName);
        if (!device) {
            return throwError('Device not found');
        }

        const service = new GoogleHome.Connecter(device.ip);
        service.config({ lang: this.config.notifier.lang });
        return from(service.speak(text));
    }

}
