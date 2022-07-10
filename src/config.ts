export class ComponentRaw {
    public id: string;
    public loxoneId?: string;
    public type: 'LIGHT' | 'THERMOSTAT' | 'BLINDS' | 'SWITCH' | 'SENSOR';
    public loxoneType: string;
    public name: string;
    public room: string;
    public customData?: {};
}

export class LoxoneConfig {
    public protocol: string;
    public url: string;
    public user: string;
    public password: string;
}

export class NotifierDevice {
    public name: string;
    public ip: string;
}

export class Notifier {
    public serverIp: string;
    public azureSubscriptionKey: string;
    public azureRegion: string;
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
    public serverPort: string;
    public loxone: LoxoneConfig;
    public components: ComponentRaw[];
    public authorizedEmails: string[];
    public oAuthUrl: string;
    public log: boolean;
    public testMode: boolean;
    public agentUserId: string;
    public notifier: Notifier;
    public weather: Weather;
}
