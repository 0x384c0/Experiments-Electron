import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { container } from "../../../shared/lib/di";
import {
  addPaginatedResourceCases,
  initialPaginatedResourceState,
  type PaginatedResourceState,
} from "../../../shared/lib/paginatedResource";
import { QuestionsInteractor } from "../domain/questionsInteractor";
import type { QuestionModel } from "../domain/models";

interface QuestionsRootState {
  questions: PaginatedResourceState<QuestionModel>;
}

export const fetchQuestions = createAsyncThunk(
  "questions/fetchQuestions",
  ({ page }: { page: number }) => container.resolve(QuestionsInteractor).getQuestions(page),
);

const questionsSlice = createSlice({
  name: "questions",
  initialState: initialPaginatedResourceState<QuestionModel>(),
  reducers: {},
  extraReducers: (builder) => addPaginatedResourceCases(builder, fetchQuestions),
});

export const questionsReducer = questionsSlice.reducer;
export const selectQuestions = (state: QuestionsRootState) => state.questions;
