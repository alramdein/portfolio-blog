import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@blog/core"],
  serverExternalPackages: ["shiki"],
};

export default config;
