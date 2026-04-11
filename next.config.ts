import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  distDir: '.next',
  output: 'standalone',
};

export default nextConfig;
