import { injectable, inject } from "../../../shared/lib/di";
import { WeatherRepository } from "./weatherRepository";
import type { ForecastModel, LocationModel } from "./models";

@injectable()
export class WeatherInteractor {
  constructor(@inject(WeatherRepository) private readonly repository: WeatherRepository) {}

  getForecast(location: LocationModel): Promise<ForecastModel> {
    return this.repository.getForecast(location);
  }
}
