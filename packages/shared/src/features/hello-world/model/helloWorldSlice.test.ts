import { describe, expect, it } from "vitest";
import { helloWorldReducer, increment } from "./helloWorldSlice";

describe("helloWorldReducer", () => {
  it("increments count", () => {
    const state = helloWorldReducer(undefined, increment());
    expect(state.count).toBe(1);
  });
});
