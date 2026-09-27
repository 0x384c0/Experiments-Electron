import type {
  ConditionModel,
  ForecastItemModel,
  ForecastModel,
  WeatherModel,
} from "../domain/models";
import type {
  ConditionState,
  CurrentWeatherState,
  ForecastWeatherState,
  WeatherState,
} from "./weatherTypes";

// weatherapi.com returns protocol-relative icon URLs (`//cdn...`)
function mapCondition(condition: ConditionModel): ConditionState {
  return { text: condition.text, icon: condition.icon.replace("//", "https://") };
}

function mapDate(dateEpoch: number): string {
  return new Date(dateEpoch * 1000).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapCurrent(current: WeatherModel): CurrentWeatherState {
  return {
    temp: `${current.temp}°`,
    wind: `${current.wind} km/h`,
    humidity: `${current.humidity}%`,
    precipitation: `${current.precipitation} mm`,
    condition: mapCondition(current.condition),
  };
}

function mapForecastItem(item: ForecastItemModel): ForecastWeatherState {
  return {
    dateEpoch: item.dateEpoch,
    date: mapDate(item.dateEpoch),
    temp: `${item.averageTemp}°`,
    chanceOfRain: `${item.chanceOfRain}%`,
    humidity: `${item.averageHumidity}%`,
    wind: `${item.maxWind} km/h`,
    condition: mapCondition(item.condition),
  };
}

export function mapForecast(forecast: ForecastModel): WeatherState {
  return {
    current: mapCurrent(forecast.current),
    forecast: forecast.forecast.map(mapForecastItem),
  };
}
