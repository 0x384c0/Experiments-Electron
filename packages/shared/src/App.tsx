import { Button, Stack, Typography } from "@mui/material";
import { useCounterStore } from "./store";

interface AppProps {
  platform: string;
}

export function App({ platform }: AppProps) {
  const { count, increment } = useCounterStore();

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">Hello World</Typography>
      <Typography variant="body2" color="text.secondary">
        running on: {platform}
      </Typography>
      <Button variant="contained" onClick={increment} sx={{ alignSelf: "flex-start" }}>
        count is {count}
      </Button>
    </Stack>
  );
}
