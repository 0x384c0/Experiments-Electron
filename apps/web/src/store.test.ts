import { describe, expect, it } from "vitest";
import { useCounterStore } from "./store";

describe("useCounterStore", () => {
  it("increments count", () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });
});
