import { Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { QuestionModel } from "../domain/models";
import { formatDate } from "../model/questionsMappers";

export function QuestionTile({ question }: { question: QuestionModel }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/questions/${question.id}`)} sx={{ p: 2 }}>
        <Typography variant="subtitle1">{question.title}</Typography>
        <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: "wrap" }}>
          {question.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {question.score} votes &middot; {question.answerCount} answers &middot;{" "}
          {question.owner.displayName} &middot; {formatDate(question.creationDate)}
        </Typography>
      </CardActionArea>
    </Card>
  );
}
