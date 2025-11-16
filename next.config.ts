import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dm0fuut1j";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "hasakeplay.com.vn" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Allow CDN host for news cover images
      { protocol: "https", hostname: "cdn.example.com" },
    ],
  },

  // ✅ URL sạch: /vi/<file>.pdf → proxy sang Cloudinary /hasake/catalogs/<file>.pdf
  async rewrites() {
    return [
      {
        source: "/:locale(vi|en)/:file*\\.pdf",
        destination: `https://res.cloudinary.com/${CLOUD}/raw/upload/hasake/catalogs/:file*.pdf`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
