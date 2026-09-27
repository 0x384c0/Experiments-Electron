import { describe, expect, it } from "vitest";
import { fetchQuestions, questionsReducer } from "./questionsSlice";
import type { QuestionModel } from "../domain/models";

function question(id: number): QuestionModel {
  return {
    id,
    title: `q${id}`,
    tags: [],
    score: 0,
    answerCount: 0,
    isAnswered: false,
    creationDate: 0,
    link: "",
    owner: { displayName: "", profileImage: "", link: "" },
  };
}

describe("questionsReducer", () => {
  it("replaces items on page 1", () => {
    const first = questionsReducer(
      undefined,
      fetchQuestions.fulfilled({ items: [question(1)], hasMore: true }, "req-1", { page: 1 }),
    );
    const refreshed = questionsReducer(
      first,
      fetchQuestions.fulfilled({ items: [question(2)], hasMore: true }, "req-2", { page: 1 }),
    );
    expect(refreshed.items).toEqual([question(2)]);
  });

  it("appends items on a later page", () => {
    const first = questionsReducer(
      undefined,
      fetchQuestions.fulfilled({ items: [question(1)], hasMore: true }, "req-1", { page: 1 }),
    );
    const nextPage = questionsReducer(
      first,
      fetchQuestions.fulfilled({ items: [question(2)], hasMore: false }, "req-2", { page: 2 }),
    );
    expect(nextPage.items).toEqual([question(1), question(2)]);
    expect(nextPage.hasMore).toBe(false);
  });
});
