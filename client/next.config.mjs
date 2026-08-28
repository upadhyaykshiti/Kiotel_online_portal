// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
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