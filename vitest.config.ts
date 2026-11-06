import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@blog/core": fileURLToPath(new URL("./packages/core/src", import.meta.url)) } },
  test: { include: ["tests/**/*.test.ts"] },
});
