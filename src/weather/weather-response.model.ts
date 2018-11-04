export class WeatherResponse {
    public temp: number;
    public humidity: number;
    public isRaining: boolean;

    constructor(temps: number[], humidities: number[], isRaining: boolean) {
        if (temps.length > 0) {
            const sum = temps.reduce((a, b) => a + b);
            this.temp = sum / temps.length;
        }

        if (humidities.length > 0) {
            const sum = humidities.reduce((a, b) => a + b);
            this.humidity = sum / humidities.length;
        }

        this.isRaining = isRaining;
    }
}
