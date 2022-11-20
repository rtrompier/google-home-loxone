import { Axios } from 'axios-observable';
import { Observable, of } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { Config } from '../config';
import { WeatherMeasure } from './weather-measure.model';
import { WeatherResponse } from './weather-response.model';
import { WeatherStation } from './weather-station.model';
import { WeatherWind } from './weather-wind.model';

export class NetatmoApi {
    private readonly config: Config;
    private token: string;
    private refreshToken: string;

    private temps: number[] = [];
    private humidities: number[] = [];
    private pressures: number[] = [];
    private isRaining: 0 | 1 = 0;
    private windStrength: number[] = [];

    constructor(config: Config) {
        this.config = config;
    }

    public getWeather(): Observable<any> {
        this.temps = [];
        this.humidities = [];
        this.pressures = [];
        this.isRaining = 0;
        this.windStrength = [];

        return this.auth()
            .pipe(
                switchMap(() => this.getData()),
                tap((resps: WeatherStation[]) => {
                    // Parse response
                    resps?.forEach((resp) => {
                        Object.keys(resp.measures).forEach((id) => {
                            this.findValue(resp.measures[id], 'temperature');
                            this.findValue(resp.measures[id], 'humidity');
                            this.findValue(resp.measures[id], 'pressure');
                            this.findRain(resp.measures[id]);
                            this.findWind(resp.measures[id]);
                        });
                    });
                }),
                map(() => new WeatherResponse(this.temps, this.humidities, this.pressures, this.isRaining, this.windStrength))
            );
    }

    /**
     * Push all temperature into the temps array
     * @param measure
     */
    private findValue(measure: any, type: 'temperature' | 'humidity' | 'pressure'): void {
        if (!measure?.type) {
            return;
        }

        const indexType = measure.type.indexOf(type);
        if (indexType === -1) {
            return;
        }

        const currentMeasure = measure as WeatherMeasure;
        Object.keys(currentMeasure.res).forEach((timestamp) => {
            if (type === 'temperature') {
                this.temps.push(currentMeasure.res[timestamp][indexType]);
            } else if (type === 'pressure') {
                this.pressures.push(currentMeasure.res[timestamp][indexType]);
            } else {
                this.humidities.push(currentMeasure.res[timestamp][indexType]);
            }
        });
    }

    private findRain(measure: any): void {
        if (!measure.rain_live || this.isRaining) {
            return;
        }

        this.isRaining = measure.rain_live > 0 ? 1 : 0;
    }

    private findWind(measure: any): void {
        if (!measure.wind_strength) {
            return;
        }

        const currentMeasure = measure as WeatherWind;
        this.windStrength.push(currentMeasure.wind_strength);
    }

    private auth(): Observable<any> {
        if (this.token) {
            return of(null);
        }

        return Axios.post(`https://api.netatmo.com/oauth2/token`, {
            'client_id': this.config.weather.clientId,
            'client_secret': this.config.weather.clientSecret,
            'grant_type': 'password',
            'username': this.config.weather.username,
            'password': this.config.weather.password,
            'scope': 'read_station',
        }, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        }).pipe(
            map((resp: any) => {
                const body = resp.data;

                if (this.config.log) {
                    console.log(`Netatmo auth response`, resp);
                }

                this.token = body.access_token;
                this.refreshToken = body.refresh_token;

                if (body.expires_in) {
                    setTimeout(() => {
                        if (this.config.log) {
                            console.log(`Refresh Netatmo token`, resp);
                        }
                        this.refreshAuth().pipe(first()).subscribe();
                    }, body.expires_in * 1000);
                }

                return body;
            }),
            catchError(err => {
                console.error('Error while requesting netatmo', err);
                throw new Error('Error')
            })
        );
    }

    private getData(): Observable<WeatherStation[]> {
        return Axios.post(`https://api.netatmo.com/api/getpublicdata`, {
            'access_token': this.token,
            'lat_ne': this.config.weather.lat_ne,
            'lon_ne': this.config.weather.lon_ne,
            'lat_sw': this.config.weather.lat_sw,
            'lon_sw': this.config.weather.lon_sw
        }).pipe(
            map((resp: any) => {
                const body = resp.data;

                if (this.config.log) {
                    console.log(`Weather response`, body);
                }

                return body.body;
            })
        );
    }

    private refreshAuth(): Observable<void> {
        return Axios.post(`https://api.netatmo.com/api/getpublicdata`, {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: this.config.weather.clientId,
            client_secret: this.config.weather.clientSecret,
        }).pipe(
            map((resp: any) => {
                const body = resp.body;

                if (this.config.log) {
                    console.log(`Netatmo refreshAuth response`, body);
                }

                this.token = body.access_token;
                this.refreshToken = body.refresh_token;

                if (body.expires_in) {
                    setTimeout(() => {
                        if (this.config.log) {
                            console.log(`Refresh Netatmo token`, resp);
                        }
                        this.refreshAuth().pipe(first()).subscribe();
                    }, body.expires_in * 1000);
                }

                return body;
            })
        );
    }

}
