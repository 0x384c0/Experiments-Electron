export interface LocationModel {
  latitude: number;
  longitude: number;
}

export interface ConditionModel {
  text: string;
  icon: string;
}

export interface WeatherModel {
  temp: number;
  wind: number;
  humidity: number;
  precipitation: number;
  condition: ConditionModel;
}

export interface ForecastItemModel {
  dateEpoch: number;
  date: string;
  averageTemp: number;
  chanceOfRain: number;
  averageHumidity: number;
  maxWind: number;
  condition: ConditionModel;
}

export interface ForecastModel {
  current: WeatherModel;
  forecast: ForecastItemModel[];
}
