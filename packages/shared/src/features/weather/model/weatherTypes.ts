export interface ConditionState {
  text: string;
  icon: string;
}

export interface CurrentWeatherState {
  temp: string;
  wind: string;
  humidity: string;
  precipitation: string;
  condition: ConditionState;
}

export interface ForecastWeatherState {
  dateEpoch: number;
  date: string;
  temp: string;
  chanceOfRain: string;
  humidity: string;
  wind: string;
  condition: ConditionState;
}

export interface WeatherState {
  current: CurrentWeatherState;
  forecast: ForecastWeatherState[];
}
