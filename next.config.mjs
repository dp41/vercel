/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir:".next",
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    trailingSlash: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
