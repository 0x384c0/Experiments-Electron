import { Card, Stack, Typography } from "@mui/material";
import type { CurrentWeatherState } from "../model/weatherTypes";

export function WeatherTile({ current }: { current: CurrentWeatherState }) {
  return (
    <Card sx={{ p: 2, display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
      <Typography sx={{ fontSize: 48 }} role="img" aria-label={current.condition.text}>
        {current.condition.icon}
      </Typography>
      <Typography variant="h3">{current.temp}</Typography>
      <Stack sx={{ ml: "auto" }}>
        <Typography variant="body2">Precipitation: {current.precipitation}</Typography>
        <Typography variant="body2">Humidity: {current.humidity}</Typography>
        <Typography variant="body2">Wind: {current.wind}</Typography>
      </Stack>
    </Card>
  );
}
