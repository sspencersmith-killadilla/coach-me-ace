import { describe, expect, it } from "vitest";
import { normalizeAskQuestions, tagCoverage, topStories, type Story } from "./prep-store";

const story = (id: string, tags: string[], score: number | null): Story => ({
  id,
  title: id,
  tags,
  text: "t",
  sourceQuestion: "",
  score,
  savedAt: `2026-01-0${id}`,
});

describe("story bank", () => {
  it("counts zero-story tags as gaps", () => {
    const coverage = tagCoverage([story("1", ["Leadership"], 8)]);
    expect(coverage["Leadership"]).toBe(1);
    expect(coverage["Conflict"]).toBe(0);
  });
  it("cheat sheet lists highest-scoring stories first", () => {
    const top = topStories([story("1", [], 5), story("2", [], 9), story("3", [], null)], 2);
    expect(top.map((s) => s.id)).toEqual(["2", "1"]);
  });
});

describe("questions to ask them", () => {
  it("keeps saved drafts within the 10-question coaching limit", () => {
    const drafts = Array.from({ length: 12 }, (_, index) => `Question ${index + 1}`);
    expect(normalizeAskQuestions(drafts)).toHaveLength(10);
    expect(normalizeAskQuestions(drafts)[9]).toBe("Question 10");
  });

  it("keeps each saved draft within the 500-character coaching limit", () => {
    expect(normalizeAskQuestions(["x".repeat(501)])[0]).toHaveLength(500);
  });
});
