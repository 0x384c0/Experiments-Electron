import { useDispatch } from "react-redux";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

// react-redux's plain useDispatch() doesn't know the store has thunk
// middleware (it does, via configureStore) -- this makes `dispatch(someThunk())`
// type-check without importing the app's own AppDispatch (features can't
// depend on `app`, see the boundary rule in CONTRIBUTING.md).
export function useAppDispatch(): ThunkDispatch<unknown, unknown, UnknownAction> {
  return useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();
}
