import { configureStore } from "@reduxjs/toolkit";
import { helloWorldReducer } from "../features/hello-world/model/helloWorldSlice";

export const store = configureStore({
  reducer: {
    helloWorld: helloWorldReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
