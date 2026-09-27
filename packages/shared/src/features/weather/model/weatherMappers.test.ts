import { describe, expect, it } from "vitest";
import { mapForecast } from "./weatherMappers";
import type { ForecastModel } from "../domain/models";

const sample: ForecastModel = {
  current: {
    temp: 22.5,
    wind: 12.3,
    humidity: 80,
    precipitation: 0,
    condition: { text: "Sunny", icon: "//cdn/sun.png" },
  },
  forecast: [
    {
      dateEpoch: 1758931200,
      date: "2026-09-27",
      averageTemp: 20,
      chanceOfRain: 10,
      averageHumidity: 70,
      maxWind: 15,
      condition: { text: "Cloudy", icon: "//cdn/cloud.png" },
    },
  ],
};

describe("mapForecast", () => {
  it("formats units and fixes protocol-relative icon URLs", () => {
    const result = mapForecast(sample);
    expect(result.current.temp).toBe("22.5°");
    expect(result.current.wind).toBe("12.3 km/h");
    expect(result.current.condition.icon).toBe("https://cdn/sun.png");
    expect(result.forecast[0].chanceOfRain).toBe("10%");
    expect(result.forecast[0].condition.icon).toBe("https://cdn/cloud.png");
  });
});
