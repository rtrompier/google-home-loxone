import {Observable} from 'rxjs';
import {Capability, CapabilityHandler} from './capability-handler';

export class ToggleSynonym {
  name_synonym: string[];
  lang: string;
}

export class Toggle {
  name: string;
  name_values: ToggleSynonym[]
}

export interface Toggles extends Capability {
  getToggles(): Toggle[]

  getStateToggles(): Observable<any>

  handleToggle(toggle: any): Observable<boolean>
}

export class TogglesHandler implements CapabilityHandler<Toggles> {
  public static INSTANCE = new TogglesHandler();

  getCommands(): string[] {
    return [
      'action.devices.commands.SetToggles',
    ];
  }

  getState(component: Toggles): Observable<any> {
    return component.getStateToggles();
  }

  getTrait(): string {
    return 'action.devices.traits.Toggles';
  }

  getAttributes(component: Toggles): any {
    return {
      availableToggles: component.getToggles()
    }
  }

  handleCommands(component: Toggles, command: string, params?: any): Observable<boolean> {
    return component.handleToggle(params['updateToggleSettings'])
  }
}
