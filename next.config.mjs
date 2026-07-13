/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable modern image formats — Next.js will serve WebP/AVIF instead of
    // the original PNG/JPEG from Supabase Storage, reducing image transfer size
    // by 30-70% and caching them at the CDN edge.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
