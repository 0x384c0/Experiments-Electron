import { Button, Stack, Typography } from "@mui/material";
import { useCounterStore } from "./store";

function App() {
  const { count, increment } = useCounterStore();

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">Hello World from Web</Typography>
      <Button variant="contained" onClick={increment} sx={{ alignSelf: "flex-start" }}>
        count is {count}
      </Button>
    </Stack>
  );
}

export default App;
