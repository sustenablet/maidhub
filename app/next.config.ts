import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Repo has a root lockfile + app lockfile; pin the app folder so Turbopack/Next
  // do not pick a parent directory as the workspace root (avoids bad chunk paths / 404s).
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
