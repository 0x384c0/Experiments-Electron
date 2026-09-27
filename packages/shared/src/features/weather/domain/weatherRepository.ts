import { injectable, inject } from "../../../shared/lib/di";
import { WeatherApiClient } from "../data/weatherApi";
import type { ForecastModel, LocationModel } from "./models";

@injectable()
export class WeatherRepository {
  constructor(@inject(WeatherApiClient) private readonly api: WeatherApiClient) {}

  async getForecast(location: LocationModel): Promise<ForecastModel> {
    const dto = await this.api.getForecast(location);
    return {
      current: {
        temp: dto.current.temp_c,
        wind: dto.current.wind_kph,
        humidity: dto.current.humidity,
        precipitation: dto.current.precip_mm,
        condition: dto.current.condition,
      },
      forecast: dto.forecast.forecastday.map((day) => ({
        dateEpoch: day.date_epoch,
        date: day.date,
        averageTemp: day.day.avgtemp_c,
        chanceOfRain: day.day.daily_chance_of_rain,
        averageHumidity: day.day.avghumidity,
        maxWind: day.day.maxwind_kph,
        condition: day.day.condition,
      })),
    };
  }
}
