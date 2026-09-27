import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { container } from "../../../shared/lib/di";
import {
  addAsyncResourceCases,
  initialAsyncResourceState,
  type AsyncResourceState,
} from "../../../shared/lib/asyncResource";
import { QuestionsInteractor } from "../domain/questionsInteractor";
import type { QuestionDetailModel } from "../domain/models";

interface QuestionDetailRootState {
  questionDetail: AsyncResourceState<QuestionDetailModel>;
}

export const fetchQuestionDetail = createAsyncThunk("questions/fetchQuestionDetail", (id: number) =>
  container.resolve(QuestionsInteractor).getQuestion(id),
);

const questionDetailSlice = createSlice({
  name: "questionDetail",
  initialState: initialAsyncResourceState<QuestionDetailModel>(),
  reducers: {},
  extraReducers: (builder) => addAsyncResourceCases(builder, fetchQuestionDetail),
});

export const questionDetailReducer = questionDetailSlice.reducer;
export const selectQuestionDetail = (state: QuestionDetailRootState) => state.questionDetail;
