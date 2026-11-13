import { describe, expect, it } from "vitest";
import { FEEDBACK_MAX, isVoterId, parseReaction } from "../apps/blog/lib/reactions";

describe("reactions", () => {
  it("accepts like, dislike and clear", () => {
    expect(parseReaction({ slug: "a", value: 1 })).toEqual({ slug: "a", value: 1, feedback: "" });
    expect(parseReaction({ slug: "a", value: -1, feedback: "  meh  " })).toEqual({ slug: "a", value: -1, feedback: "meh" });
    expect(parseReaction({ slug: "a", value: 0 })?.value).toBe(0);
  });

  it("rejects bad input", () => {
    expect(parseReaction(null)).toBeNull();
    expect(parseReaction({ slug: "a", value: 2 })).toBeNull();
    expect(parseReaction({ slug: "a", value: "1" })).toBeNull();
    expect(parseReaction({ slug: "", value: 1 })).toBeNull();
    expect(parseReaction({ slug: "a", value: 1, feedback: 5 })).toBeNull();
  });

  it("caps feedback length", () => {
    expect(parseReaction({ slug: "a", value: 1, feedback: "x".repeat(5000) })?.feedback).toHaveLength(FEEDBACK_MAX);
  });

  it("only trusts uuid voter cookies", () => {
    expect(isVoterId("7f9c1c2e-4b1a-4c3d-9e8f-0123456789ab")).toBe(true);
    expect(isVoterId("'; drop table")).toBe(false);
    expect(isVoterId(undefined)).toBe(false);
  });
});
