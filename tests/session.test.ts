import { beforeEach, describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "../apps/admin/lib/session";

describe("session", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "a".repeat(32);
    process.env.ADMIN_USERNAME = "alif";
  });

  it("accepts its own token", async () => {
    expect(await verifySessionToken(await createSessionToken("alif"))).toBe(true);
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken("alif");
    process.env.SESSION_SECRET = "b".repeat(32);
    expect(await verifySessionToken(token)).toBe(false);
  });

  it("rejects a token for a different user, and missing tokens", async () => {
    expect(await verifySessionToken(await createSessionToken("mallory"))).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("garbage")).toBe(false);
  });
});
