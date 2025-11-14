import Providers from "@/provider";
import "./globals.css";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Caladea } from "next/font/google";
import TopProgressBar from "@/components/shared/top-progress-bar";

const caladea = Caladea({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caladea",
});

export const metadata: Metadata = {
  title: { default: "Hasake Play", template: "%s | Hasake Play" },
  description: "Giải pháp vui chơi hiện đại...",
  icons: { icon: [{ url: "/Logo/hasakelogo.png" }] },
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
        </Providers>
      </body>
    </html>
  );
}
