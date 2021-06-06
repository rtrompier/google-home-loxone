import { Request } from 'express-serve-static-core';
import { Observable, throwError } from 'rxjs';
import { Config } from '../config';
import { NotifierService } from './notifier-service.model';

export class Notifier {
    private readonly config: Config;
    private devices: NotifierService[] = [];

    constructor(config: Config) {
        this.config = config;
        this.devices = config?.notifier?.devices;
    }

    public handler(request: Request): Observable<any> {
        const deviceName = request.query.device;
        const text = request.query.text;

        if (this.config.log) {
            console.log('Notifier request received', deviceName, text, request);
        }

        const device = this.devices.find((dev) => dev.name === deviceName);
        if (!device) {
            return throwError('Device not found');
        }

        return throwError(`Deprecated operation`);
    }

}
