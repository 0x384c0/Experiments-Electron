import { useEffect, useRef } from "react";
import { Alert, Button, CircularProgress, IconButton, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../shared/lib/hooks";
import { fetchQuestions, selectQuestions } from "../model/questionsSlice";
import { QuestionTile } from "./QuestionTile";

export function QuestionsScreen() {
  const dispatch = useAppDispatch();
  const { items, page, hasMore, status, error } = useSelector(selectQuestions);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (items.length === 0) dispatch(fetchQuestions({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // infinite scroll: fetch the next page once the sentinel below the list scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && status === "ready") {
        dispatch(fetchQuestions({ page: page + 1 }));
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, hasMore, status, page]);

  if (status === "loading" && items.length === 0) {
    return (
      <Stack sx={{ alignItems: "center", p: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (status === "error" && items.length === 0) {
    return (
      <Stack spacing={2} sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => dispatch(fetchQuestions({ page: 1 }))}
          sx={{ alignSelf: "flex-start" }}
        >
          Retry
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={() => dispatch(fetchQuestions({ page: 1 }))} aria-label="refresh">
          <RefreshIcon />
        </IconButton>
      </Stack>
      {status === "error" && <Alert severity="warning">{error}</Alert>}
      {items.map((question) => (
        <QuestionTile key={question.id} question={question} />
      ))}
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
      {status === "loading-more" && (
        <Stack sx={{ alignItems: "center", p: 2 }}>
          <CircularProgress size={24} />
        </Stack>
      )}
    </Stack>
  );
}
