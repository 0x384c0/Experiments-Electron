import { createSlice } from "@reduxjs/toolkit";

interface HelloWorldState {
  count: number;
}

// scoped to this slice, not the app's full RootState -- a feature must not
// depend on `app` (that's the composition root, it depends on features, not
// the other way around).
interface HelloWorldRootState {
  helloWorld: HelloWorldState;
}

const initialState: HelloWorldState = { count: 0 };

const helloWorldSlice = createSlice({
  name: "helloWorld",
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
  },
});

export const { increment } = helloWorldSlice.actions;
export const helloWorldReducer = helloWorldSlice.reducer;
export const selectCount = (state: HelloWorldRootState) => state.helloWorld.count;
