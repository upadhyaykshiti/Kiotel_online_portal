// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;



import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits .next/standalone -- a self-contained server.js plus only the
  // node_modules actually traced as reachable. Without this the runtime
  // image has to carry all ~981 MB of node_modules.
  output: 'standalone',
  // Root package-lock exists for lefthook/knip; pin tracing to the repo root.
  outputFileTracingRoot: path.join(__dirname, ".."),
  transpilePackages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        /^@univerjs/,
        'rxjs',
      ];
    }
    return config;
  },
};

export default nextConfig;