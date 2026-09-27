import { injectable } from "../../../shared/lib/di";
import type { LocationModel } from "../domain/models";

const BASE_URL = "https://api.weatherapi.com/v1";
const FORECAST_DAYS = 10;

export interface ConditionDto {
  text: string;
  icon: string;
}

export interface DayDto {
  avghumidity: number;
  avgtemp_c: number;
  daily_chance_of_rain: number;
  maxwind_kph: number;
  condition: ConditionDto;
}

export interface ForecastDayDto {
  date: string;
  date_epoch: number;
  day: DayDto;
}

export interface CurrentDto {
  temp_c: number;
  wind_kph: number;
  humidity: number;
  precip_mm: number;
  condition: ConditionDto;
}

export interface ForecastResponseDto {
  current: CurrentDto;
  forecast: { forecastday: ForecastDayDto[] };
}

// key comes from .env.example -> VITE_WEATHER_API_KEY, get a free one at weatherapi.com
@injectable()
export class WeatherApiClient {
  async getForecast(location: LocationModel): Promise<ForecastResponseDto> {
    const url = new URL(`${BASE_URL}/forecast.json`);
    const env = import.meta.env as Record<string, string | undefined>;
    url.searchParams.set("key", env.VITE_WEATHER_API_KEY ?? "");
    url.searchParams.set("q", `${location.latitude}, ${location.longitude}`);
    url.searchParams.set("days", String(FORECAST_DAYS));
    url.searchParams.set("aqi", "false");
    url.searchParams.set("alerts", "false");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`weather api error: ${response.status}`);
    }
    return response.json() as Promise<ForecastResponseDto>;
  }
}
