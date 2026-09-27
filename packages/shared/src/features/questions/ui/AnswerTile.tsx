import { Card, Chip, Stack, Typography } from "@mui/material";
import type { AnswerModel } from "../domain/models";
import { SanitizedHtml } from "./SanitizedHtml";

export function AnswerTile({ answer }: { answer: AnswerModel }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {answer.score} votes &middot; {answer.owner.displayName}
        </Typography>
        {answer.isAccepted && <Chip label="Accepted" color="success" size="small" />}
      </Stack>
      <SanitizedHtml html={answer.body} />
    </Card>
  );
}
