/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir:"out",
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    trailingSlash: true
};

export default nextConfig;
