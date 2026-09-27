import type { ActionReducerMapBuilder, AsyncThunk } from "@reduxjs/toolkit";

// Generic async-fetch-into-a-slice pattern: any feature with a
// loading/error/data screen uses this instead of hand-rolling it.
export interface AsyncResourceState<T> {
  data: T | null;
  status: "loading" | "error" | "ready";
  error: string | null;
}

export function initialAsyncResourceState<T>(): AsyncResourceState<T> {
  return { data: null, status: "loading", error: null };
}

export function addAsyncResourceCases<T, Arg>(
  builder: ActionReducerMapBuilder<AsyncResourceState<T>>,
  thunk: AsyncThunk<T, Arg, object>,
): void {
  builder
    .addCase(thunk.pending, (state) => {
      state.status = "loading";
    })
    .addCase(thunk.fulfilled, (state, action) => {
      // Immer's Draft<T> doesn't distribute over an unconstrained generic T,
      // this assignment is sound (payload really is this slice's T) -- bypass
      // the mapped type locally rather than fight it.
      (state as { data: T | null }).data = action.payload;
      state.status = "ready";
      state.error = null;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.status = "error";
      state.error = action.error.message ?? "Unknown error";
    });
}
