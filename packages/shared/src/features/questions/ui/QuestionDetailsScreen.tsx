import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../shared/lib/hooks";
import { fetchQuestionDetail, selectQuestionDetail } from "../model/questionDetailSlice";
import { fetchAnswers, selectQuestionAnswers } from "../model/questionAnswersSlice";
import { AnswerTile } from "./AnswerTile";
import { SanitizedHtml } from "./SanitizedHtml";

export function QuestionDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const questionId = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const question = useSelector(selectQuestionDetail);
  const answers = useSelector(selectQuestionAnswers);

  useEffect(() => {
    dispatch(fetchQuestionDetail(questionId));
    dispatch(fetchAnswers({ questionId, page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  if (question.status === "loading" && !question.data) {
    return (
      <Stack sx={{ alignItems: "center", p: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (question.status === "error" && !question.data) {
    return (
      <Stack sx={{ p: 4 }}>
        <Alert severity="error">{question.error}</Alert>
      </Stack>
    );
  }

  if (!question.data) return null;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">{question.data.title}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        {question.data.tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" />
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {question.data.score} votes &middot; {question.data.owner.displayName}
      </Typography>
      <SanitizedHtml html={question.data.body} />

      <Typography variant="h6">Answers</Typography>
      {answers.status === "loading" && answers.items.length === 0 && <CircularProgress size={24} />}
      {answers.status === "error" && answers.items.length === 0 && (
        <Alert severity="error">{answers.error}</Alert>
      )}
      {answers.items.map((answer) => (
        <AnswerTile key={answer.id} answer={answer} />
      ))}
      {answers.hasMore && (
        <Button
          onClick={() => dispatch(fetchAnswers({ questionId, page: answers.page + 1 }))}
          disabled={answers.status === "loading-more"}
          sx={{ alignSelf: "flex-start" }}
        >
          {answers.status === "loading-more" ? "Loading..." : "Load more answers"}
        </Button>
      )}
    </Stack>
  );
}
