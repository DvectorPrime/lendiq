import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // or path.resolve(__dirname)
  },
};

export default nextConfig;
