/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix for react-pdf / pdfjs-dist canvas requirement
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
