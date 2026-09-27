import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { container } from "../../../shared/lib/di";
import {
  addPaginatedResourceCases,
  initialPaginatedResourceState,
  type PaginatedResourceState,
} from "../../../shared/lib/paginatedResource";
import { QuestionsInteractor } from "../domain/questionsInteractor";
import type { AnswerModel } from "../domain/models";

interface QuestionAnswersRootState {
  questionAnswers: PaginatedResourceState<AnswerModel>;
}

export const fetchAnswers = createAsyncThunk(
  "questions/fetchAnswers",
  ({ questionId, page }: { questionId: number; page: number }) =>
    container.resolve(QuestionsInteractor).getAnswers(questionId, page),
);

const questionAnswersSlice = createSlice({
  name: "questionAnswers",
  initialState: initialPaginatedResourceState<AnswerModel>(),
  reducers: {},
  extraReducers: (builder) => addPaginatedResourceCases(builder, fetchAnswers),
});

export const questionAnswersReducer = questionAnswersSlice.reducer;
export const selectQuestionAnswers = (state: QuestionAnswersRootState) => state.questionAnswers;
