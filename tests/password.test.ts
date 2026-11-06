import { describe, expect, it } from "vitest";
import { hashPassword, safeEqual, verifyPassword } from "../apps/admin/lib/password";

describe("password", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(hash).not.toContain("$");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt:aa:bb")).toBe(false);
  });

  it("compares strings of different length safely", () => {
    expect(safeEqual("admin", "admin")).toBe(true);
    expect(safeEqual("admin", "admin2")).toBe(false);
  });
});
