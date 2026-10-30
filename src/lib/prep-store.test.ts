import { describe, expect, it } from "vitest";
import { tagCoverage, topStories, type Story } from "./prep-store";

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
