import { forkJoin, of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { ErrorType } from '../error';
import { Capability, CapabilityHandler } from './capability-handler';

export class OpenCloseAttributes {
    discreteOnlyOpenClose?: boolean;
    openDirection?: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'IN' | 'OUT'>;
    commandOnlyOpenClose?: boolean;
    queryOnlyOpenClose?: boolean;
}

export interface OpenClose extends Capability {
    open(): Observable<boolean>;

    close(): Observable<boolean>;

    getPosition(): Observable<number>;

    setPosition(percent: number): Observable<boolean>;

    getOpenDirection(): Observable<string>;

    getAttributes(): OpenCloseAttributes;
}

export class OpenCloseHandler implements CapabilityHandler<OpenClose> {
    public static INSTANCE = new OpenCloseHandler();

    getCommands(): string[] {
        return ['action.devices.commands.OpenClose'];
    }

    getTrait(): string {
        return 'action.devices.traits.OpenClose'
    }

    getAttributes(component: OpenClose): OpenCloseAttributes {
        return component.getAttributes();
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
        if (this.getAttributes(component)?.queryOnlyOpenClose) {
            console.error('Component with queryOnlyOpenClose attribute can not be commanded');
            throw new Error(ErrorType.NOT_SUPPORTED_IN_CURRENT_MODE);
        }

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
