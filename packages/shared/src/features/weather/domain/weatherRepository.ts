import { injectable, inject } from "../../../shared/lib/di";
import { WeatherApiClient } from "../data/weatherApi";
import { mapWeatherCode } from "./weatherCode";
import type { ForecastModel, LocationModel } from "./models";

function toEpoch(isoDate: string): number {
  return Math.floor(new Date(isoDate).getTime() / 1000);
}

// (max + min) / 2 produces float noise (e.g. -1.7999999999999998); one
// decimal place matches the source data's own precision.
function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

@injectable()
export class WeatherRepository {
  constructor(@inject(WeatherApiClient) private readonly api: WeatherApiClient) {}

  async getForecast(location: LocationModel): Promise<ForecastModel> {
    const dto = await this.api.getForecast(location);
    return {
      current: {
        temp: dto.current.temperature_2m,
        wind: dto.current.wind_speed_10m,
        humidity: dto.current.relative_humidity_2m,
        precipitation: dto.current.precipitation,
        condition: mapWeatherCode(dto.current.weather_code),
      },
      forecast: dto.daily.time.map((date, i) => ({
        dateEpoch: toEpoch(date),
        date,
        averageTemp: roundToOneDecimal(
          (dto.daily.temperature_2m_max[i] + dto.daily.temperature_2m_min[i]) / 2,
        ),
        chanceOfRain: dto.daily.precipitation_probability_max[i],
        averageHumidity: dto.daily.relative_humidity_2m_mean[i],
        maxWind: dto.daily.wind_speed_10m_max[i],
        condition: mapWeatherCode(dto.daily.weather_code[i]),
      })),
    };
  }
}
