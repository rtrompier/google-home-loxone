import { Observable, of, Subject } from 'rxjs/index';
import { map } from 'rxjs/operators';
import { Config } from './config';

const LoxoneWebSocket = require('node-lox-ws-api');

export class LoxoneRequest {
    private socket: any;
    private structureFile: any;
    private commandChain = [];
    private structureSubject: Subject<any>;
    private config: Config;

    constructor(config: Config) {
        this.config = config;
        this.socket = new LoxoneWebSocket(config.loxone.url, config.loxone.user, config.loxone.password, true);
        this.connect();

        this.structureSubject = new Subject<any>();

        this.socket.on('get_structure_file', (data) => {
            this.structureFile = data;
            this.structureSubject.next(data);
            this.structureSubject.complete();
        });
    }

    connect() {
        this.socket.connect();
        this.socket.on('connect_failed', () => {
            console.error('Connection to Loxone failed');
            setTimeout(() => this.socket.connect(), 10000);
        });

        this.socket.on('message_text', (message) => {
            for (let index = this.commandChain.length - 1; index >= 0; index--) {
                const item = this.commandChain[index];
                if (item.control === message.control) {
                    item.callback(message);
                    this.commandChain.splice(index, 1);
                    break;
                }
            }
        })
    }

    watchComponent(uuid: string): Observable<any> {
        const events = new Subject<any>();

        this.socket.on(`update_event_value_${uuid}`, (state) => {
            events.next(state);
        });

        return events;
    }

    sendCmd(uuidAction: string, state: string): Observable<any> {
        // Do not send command in test mode
        if (this.config.testMode) {
            return of({
                code: '200',
            });
        }

        const events = new Subject<any>();

        // const commandEdited = this.socket._auth.prepare_control_command(uuidAction, state);
        const commandEdited = `jdev/sps/io/${uuidAction}/${state}`;

        this.commandChain.push({
            'control': `dev/sps/io/${uuidAction}/${state}`,
            'callback': (result) => {
                events.next(result);
                events.complete();
            }
        });

        if (this.config.log) {
            console.log(`WS: Send Cmd: ${commandEdited}`);
        }
        this.socket.send_command(commandEdited, false);

        return events;
    }

    getControlInformation(uuid: string): Observable<any> {
        return this.getStructureFile().pipe(map(structure => {
            return structure['controls'][uuid];
        }))
    }

    getStructureFile(): Observable<any> {
        if (this.structureFile !== undefined) {
            return of(this.structureFile);
        }
        return this.structureSubject;
    }
}
