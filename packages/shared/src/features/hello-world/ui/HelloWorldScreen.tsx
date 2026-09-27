import { Button, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useInjection } from "../../../shared/lib/useInjection";
import { HelloWorldService } from "../model/helloWorldService";
import { increment, selectCount } from "../model/helloWorldSlice";

export function HelloWorldScreen() {
  const platform = useInjection(HelloWorldService).getPlatformLabel();
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">Hello World</Typography>
      <Typography variant="body2" color="text.secondary">
        running on: {platform}
      </Typography>
      <Button
        variant="contained"
        onClick={() => dispatch(increment())}
        sx={{ alignSelf: "flex-start" }}
      >
        count is {count}
      </Button>
    </Stack>
  );
}
