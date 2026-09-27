import { injectable } from "../../../shared/lib/di";
import type { LocationModel } from "../domain/models";

// no API key, no signup -- https://open-meteo.com
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 10;

export interface CurrentDto {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
}

export interface DailyDto {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  relative_humidity_2m_mean: number[];
  wind_speed_10m_max: number[];
  weather_code: number[];
}

export interface ForecastResponseDto {
  current: CurrentDto;
  daily: DailyDto;
}

@injectable()
export class WeatherApiClient {
  async getForecast(location: LocationModel): Promise<ForecastResponseDto> {
    const url = new URL(BASE_URL);
    url.searchParams.set("latitude", String(location.latitude));
    url.searchParams.set("longitude", String(location.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,weather_code",
    );
    url.searchParams.set("forecast_days", String(FORECAST_DAYS));
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`weather api error: ${response.status}`);
    }
    return response.json() as Promise<ForecastResponseDto>;
  }
}
