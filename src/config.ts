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

export class NotifierDevice {
    public name: string;
    public ip: string;
}

export class Notifier {
    public lang: string;
    public devices: NotifierDevice[];
}

export class Weather {
    public clientId: string;
    public clientSecret: string;
    public username: string;
    public password: string;
    public lat_ne: string;
    public lon_ne: string;
    public lat_sw: string;
    public lon_sw: string;
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
    public notifier: Notifier;
    public weather: Weather;
}
