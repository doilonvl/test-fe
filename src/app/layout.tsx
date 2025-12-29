import Providers from "@/provider";
import "./globals.css";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Caladea } from "next/font/google";
import TopProgressBar from "@/components/shared/top-progress-bar";
import ScrollToTopButton from "@/components/shared/scroll-to-top-button";

const caladea = Caladea({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caladea",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.hasakeplay.com.vn"
  ),
  title: { default: "Hasake Play", template: "%s | Hasake Play" },
  description: "Giải pháp vui chơi hiện đại...",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={caladea.variable}>
      <body>
        <Providers>
          <TopProgressBar />
          {children}
          <ScrollToTopButton />
        </Providers>
      </body>
    </html>
  );
}
