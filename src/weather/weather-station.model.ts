import { WeatherMeasure } from './weather-measure.model';
import { WeatherPlace } from './weather-place.model';
import { WeatherRain } from './weather-rain.model';

export class WeatherStation {
    public _id: string;
    public place: WeatherPlace;
    public mark: number;
    public measures: Map<string, WeatherMeasure|WeatherRain>;
    public modules: string[];
    public module_types: Map<string, string>;
}
