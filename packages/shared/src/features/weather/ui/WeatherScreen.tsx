import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, CircularProgress, IconButton, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../shared/lib/hooks";
import { fetchForecast, selectWeather } from "../model/weatherSlice";
import { WeatherTile } from "./WeatherTile";
import { ForecastTile } from "./ForecastTile";

export function WeatherScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, status, error } = useSelector(selectWeather);

  useEffect(() => {
    if (!data) dispatch(fetchForecast());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading" && !data) {
    return (
      <Stack sx={{ alignItems: "center", p: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (status === "error" && !data) {
    return (
      <Stack spacing={2} sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => dispatch(fetchForecast())}
          sx={{ alignSelf: "flex-start" }}
        >
          Retry
        </Button>
      </Stack>
    );
  }

  if (!data) return null;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={() => dispatch(fetchForecast())} aria-label="refresh">
          <RefreshIcon />
        </IconButton>
      </Stack>
      {status === "error" && <Alert severity="warning">{error}</Alert>}
      <WeatherTile current={data.current} />
      {data.forecast.map((day) => (
        <ForecastTile
          key={day.dateEpoch}
          day={day}
          onClick={() => navigate(`/weather/${day.dateEpoch}`)}
        />
      ))}
    </Stack>
  );
}
