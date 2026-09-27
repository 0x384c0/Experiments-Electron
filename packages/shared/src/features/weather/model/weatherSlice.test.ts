import { describe, expect, it } from "vitest";
import { fetchForecast, weatherReducer } from "./weatherSlice";
import type { WeatherState } from "./weatherTypes";

const weatherState: WeatherState = {
  current: {
    temp: "20°",
    wind: "10 km/h",
    humidity: "50%",
    precipitation: "0 mm",
    condition: { text: "Clear", icon: "" },
  },
  forecast: [],
};

describe("weatherReducer", () => {
  it("goes to error status with a message on a rejected fetch", () => {
    const rejected = fetchForecast.rejected(new Error("network down"), "req-id");
    const state = weatherReducer(undefined, rejected);
    expect(state.status).toBe("error");
    expect(state.error).toBe("network down");
  });

  it("goes to ready status with data on a fulfilled fetch", () => {
    const fulfilled = fetchForecast.fulfilled(weatherState, "req-id");
    const state = weatherReducer(undefined, fulfilled);
    expect(state.status).toBe("ready");
    expect(state.data).toEqual(weatherState);
  });
});
