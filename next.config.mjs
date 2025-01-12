/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir:"out",
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
