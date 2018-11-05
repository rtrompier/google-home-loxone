export class WeatherResponse {
    public temp: number;
    public humidity: number;
    public pressure: number;
    public isRaining: boolean;
    public windStrength: number;

    constructor(temps: number[], humidities: number[], pressures: number[], isRaining: boolean, windStrengths: number[]) {
        if (temps.length > 0) {
            const sum = temps.reduce((a, b) => a + b);
            this.temp = (sum / temps.length * 100) / 100;
        }

        if (humidities.length > 0) {
            const sum = humidities.reduce((a, b) => a + b);
            this.humidity = (sum / humidities.length * 100) / 100;
        }

        if (pressures.length > 0) {
            const sum = pressures.reduce((a, b) => a + b);
            this.pressure = (sum / pressures.length * 100) / 100;
        }

        if (windStrengths.length > 0) {
            const sum = windStrengths.reduce((a, b) => a + b);
            this.windStrength = sum / windStrengths.length;
        }

        this.isRaining = isRaining;
    }
}
