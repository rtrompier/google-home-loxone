import axios from 'axios';
import { Client, DefaultMediaReceiver } from 'castv2-client';
import { Request } from 'express-serve-static-core';
import { getAudioUrl } from 'google-tts-api';
import * as os from 'os';
import { Observable, throwError } from 'rxjs';
import { Config } from '../config';
import { NotifierService } from './notifier-service.model';

export class Notifier {
    private readonly config: Config;
    private devices: NotifierService[] = [];
    private client: Client;

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

        return new Observable((observer) => {
            const url = `http://${this.getServerIp()}:${this.config.serverPort}/speech/stream?text=${text}`;
            this.client = new Client();
            this.client.connect(device.ip, () => {
                this.client.launch(DefaultMediaReceiver, (err, player) => {
                    const media = {
                        contentId: url,
                        contentType: "audio/mp3",
                        streamType: "BUFFERED",
                    };

                    player.load(media, { autoplay: true }, (err, status) => {
                        this.client.close();
                        observer.next(status);
                        observer.complete();
                        console.log(`Pushed message to device at ${device.ip}`);
                    });
                });
            });

            this.client.on("error", (err) => {
                observer.error(`Google Cast Client error:\n${err}`);
                this.client.close();
            });
        });
    }

    public streamHandler(request: Request): Observable<any> {
        const text = request?.query?.text as string;
        const url = getAudioUrl(text, { lang: this.config.notifier.lang });
        return new Observable((observer) => {
            const response = axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            }).then((response) => {
                observer.next(response.data);
                observer.complete();
            }).catch((error) => {
                observer.error(error);
            })
        });
    }

    private getServerIp(): string {
        if (this.config.notifier.serverIp) {
            return this.config.notifier.serverIp;
        }

        let address = null;
        const ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address : undefined);
        }

        return address;
    }

}
