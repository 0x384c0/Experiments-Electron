import type { ActionReducerMapBuilder, AsyncThunk } from "@reduxjs/toolkit";

// Generic paginated-list-with-load-more pattern: any feature with an
// infinite-scroll or "load more" list uses this instead of hand-rolling it.
export interface PaginatedResourceState<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  status: "loading" | "loading-more" | "error" | "ready";
  error: string | null;
}

export function initialPaginatedResourceState<T>(): PaginatedResourceState<T> {
  return { items: [], page: 0, hasMore: true, status: "loading", error: null };
}

export interface PaginatedFetchResult<T> {
  items: T[];
  hasMore: boolean;
}

// page: 1 means "first page" (replaces items), anything higher appends --
// the thunk arg carries it so the reducer knows without guessing from state.
export interface PaginatedFetchArg {
  page: number;
}

export function addPaginatedResourceCases<T, Arg extends PaginatedFetchArg>(
  builder: ActionReducerMapBuilder<PaginatedResourceState<T>>,
  thunk: AsyncThunk<PaginatedFetchResult<T>, Arg, object>,
): void {
  builder
    .addCase(thunk.pending, (state, action) => {
      state.status = action.meta.arg.page === 1 ? "loading" : "loading-more";
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const isFirstPage = action.meta.arg.page === 1;
      // Immer's Draft<T> doesn't distribute over an unconstrained generic T,
      // this is sound -- bypass the mapped type locally rather than fight it
      // (same issue as asyncResource.ts). Cast before spreading, not after,
      // or the spread itself infers a (T | Draft<T>)[] union.
      const previousItems = state.items as T[];
      const items = isFirstPage
        ? action.payload.items
        : [...previousItems, ...action.payload.items];
      (state as { items: T[] }).items = items;
      state.page = action.meta.arg.page;
      state.hasMore = action.payload.hasMore;
      state.status = "ready";
      state.error = null;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.status = "error";
      state.error = action.error.message ?? "Unknown error";
    });
}
