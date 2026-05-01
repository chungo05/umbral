import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // basePath only active in GitHub Actions so localhost stays clean
  basePath: process.env.GITHUB_ACTIONS ? "/umbral" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/umbral/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
