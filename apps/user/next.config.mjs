/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile the shared workspace packages (they ship raw TS/TSX, no build step).
  transpilePackages: [
    '@shopwave/ui',
    '@shopwave/hooks',
    '@shopwave/api-client',
    '@shopwave/types',
  ],
  images: {
    // Seed images come from picsum.photos — allow optimizing them.
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
};

export default nextConfig;
