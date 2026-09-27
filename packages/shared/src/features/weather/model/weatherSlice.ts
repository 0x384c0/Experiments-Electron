import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { container } from "../../../shared/lib/di";
import {
  addAsyncResourceCases,
  initialAsyncResourceState,
  type AsyncResourceState,
} from "../../../shared/lib/asyncResource";
import { GeoLocationProvider } from "../domain/geoLocationProvider";
import { WeatherInteractor } from "../domain/weatherInteractor";
import { mapForecast } from "./weatherMappers";
import type { WeatherState } from "./weatherTypes";

interface WeatherRootState {
  weather: AsyncResourceState<WeatherState>;
}

export const fetchForecast = createAsyncThunk("weather/fetchForecast", async () => {
  const location = await container.resolve(GeoLocationProvider).getLocation();
  const forecast = await container.resolve(WeatherInteractor).getForecast(location);
  return mapForecast(forecast);
});

const weatherSlice = createSlice({
  name: "weather",
  initialState: initialAsyncResourceState<WeatherState>(),
  reducers: {},
  extraReducers: (builder) => addAsyncResourceCases(builder, fetchForecast),
});

export const weatherReducer = weatherSlice.reducer;
export const selectWeather = (state: WeatherRootState) => state.weather;
