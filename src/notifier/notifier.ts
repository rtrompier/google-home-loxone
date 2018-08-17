import { Request } from 'express-serve-static-core';
import * as mdns from 'mdns';
import * as GoogleHome from 'node-googlehome';
import { from, Observable, throwError } from 'rxjs';
import { Config } from '../config';
import { NotifierService } from './notifier-service.model';

export class Notifier {
    private readonly config: Config;
    private devices: NotifierService[] = [];

    constructor(config: Config) {
        this.config = config;
        this.loadDevices();
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

    /**
     * Load all Google Home devices on network
     */
    private loadDevices(): void {
        const browser = mdns.createBrowser(mdns.tcp('googlecast'));
        try { browser.start(); } catch (e) { }

        const tmpServices = [];
        browser.on('serviceUp', (service) => {
            tmpServices.push(service);
        });

        setTimeout(() => {
            browser.stop();
            this.devices = tmpServices
                .filter((service) => service.txtRecord.md.indexOf('Google Home') !== -1)
                .map((service) => {
                    const name = service.txtRecord.fn;
                    const ip = service.addresses[0];
                    return new NotifierService(name, ip);
                });

            console.log('Google Home Device detected', this.devices);
        }, 2000);
    }
}
