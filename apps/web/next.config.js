/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARNING !!
    // This allows production builds to successfully complete even if
    // your project has type errors. This is a workaround, not a true fix.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
