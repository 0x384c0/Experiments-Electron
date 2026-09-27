import { configureStore } from "@reduxjs/toolkit";
import { weatherReducer } from "../features/weather/model/weatherSlice";
import { questionsReducer } from "../features/questions/model/questionsSlice";
import { questionDetailReducer } from "../features/questions/model/questionDetailSlice";
import { questionAnswersReducer } from "../features/questions/model/questionAnswersSlice";

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    questions: questionsReducer,
    questionDetail: questionDetailReducer,
    questionAnswers: questionAnswersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
