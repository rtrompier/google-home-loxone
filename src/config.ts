export class ComponentRaw {
    public id: string;
    public loxoneId?: string;
    public type: string;
    public loxoneType: string;
    public name: string;
    public room: string;
    public customData?: {};
    public extendedOption?: ExtendedOption;
}

export class ExtendedOption {
    public brightness: boolean;
}

export class LoxoneConfig {
    public url: string;
    public user: string;
    public password: string;
}

export class Config {
    public loxone: LoxoneConfig;
    public components: ComponentRaw[];
    public authorizedEmails: string[];
    public oAuthUrl: string;
    public log: boolean;
    public testMode: boolean;
    public agentUserId: string;
    public token: string;
}
