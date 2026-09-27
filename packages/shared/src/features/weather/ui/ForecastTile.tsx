import { Card, CardActionArea, Typography } from "@mui/material";
import type { ForecastWeatherState } from "../model/weatherTypes";

export function ForecastTile({ day, onClick }: { day: ForecastWeatherState; onClick: () => void }) {
  return (
    <Card>
      <CardActionArea
        onClick={onClick}
        sx={{ p: 1.5, display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}
      >
        <Typography sx={{ flex: 1 }}>{day.date}</Typography>
        <Typography variant="body1">{day.temp}</Typography>
        <img src={day.condition.icon} alt={day.condition.text} width={32} height={32} />
      </CardActionArea>
    </Card>
  );
}
