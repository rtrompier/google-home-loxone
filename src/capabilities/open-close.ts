import { forkJoin, of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { Capability, CapabilityHandler } from './capability-handler';

export interface OpenClose extends Capability {
    open(): Observable<boolean>;

    close(): Observable<boolean>;

    getPosition(): Observable<number>;

    setPosition(percent: number): Observable<boolean>;

    getOpenDirection(): Observable<string>;
}

export class OpenCloseHandler implements CapabilityHandler<OpenClose> {
    public static INSTANCE = new OpenCloseHandler();

    getCommands(): string[] {
        return ['action.devices.commands.OpenClose'];
    }

    getTrait(): string {
        return 'action.devices.traits.OpenClose'
    }

    getAttributes(component: OpenClose): any {
        return {}
    }

    getState(component: OpenClose): Observable<any> {
        return forkJoin([
            component.getPosition(),
            component.getOpenDirection(),
        ]).pipe(map(resp => {
            return {
                openState: [{
                    openPercent: resp[0],
                    openDirection: resp[1]
                }]
            };
        }));
    }

    handleCommands(component: OpenClose, command: string, payload?: any): Observable<boolean> {
        const percent = payload['openPercent'];

        if (percent === 0) {
            return component.close()
        } else if (percent === 100) {
            return component.open();
        } else if (percent > 0 && percent < 100) {
            return component.setPosition(+percent);
        } else {
            console.error('Error during moving blind', component, payload);
            of(false);
        }
    }
}
