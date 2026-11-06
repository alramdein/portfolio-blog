import { describe, expect, it } from "vitest";
import { isBot, visitorHash } from "../apps/blog/lib/views";

describe("views", () => {
  it("hashes visitors stably without exposing the IP", () => {
    const a = visitorHash("1.2.3.4", "Mozilla", "salt");
    expect(a).toBe(visitorHash("1.2.3.4", "Mozilla", "salt"));
    expect(a).not.toContain("1.2.3.4");
    expect(a).not.toBe(visitorHash("1.2.3.5", "Mozilla", "salt"));
    expect(a).not.toBe(visitorHash("1.2.3.4", "Mozilla", "other"));
  });

  it("skips crawlers and empty user agents", () => {
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot("Mozilla/5.0 (Macintosh) Safari/605.1.15")).toBe(false);
  });
});
