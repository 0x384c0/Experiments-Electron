import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../shared/lib/hooks";
import { fetchForecast, selectWeather } from "../model/weatherSlice";

export function ForecastDetailsScreen() {
  const { dateEpoch } = useParams<{ dateEpoch: string }>();
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
      <Stack sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  const day = data?.forecast.find((item) => String(item.dateEpoch) === dateEpoch);

  if (!day) {
    return (
      <Stack sx={{ p: 4 }}>
        <Alert severity="warning">No forecast for this day.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">{day.date}</Typography>
      </Stack>
      <img src={day.condition.icon} alt={day.condition.text} width={64} height={64} />
      <Typography>Chance of rain: {day.chanceOfRain}</Typography>
      <Typography>Humidity: {day.humidity}</Typography>
      <Typography>Wind: {day.wind}</Typography>
    </Stack>
  );
}
