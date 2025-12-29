/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Script from "next/script";
import { listNews } from "./_data";
import { getTranslations } from "next-intl/server";
import NewsCard from "./_components/NewsCard";
// Removed paginate in favor of a slider for row 2
import NewsCarousel from "./_components/Carousel";
import NewsBreadcrumbs from "./_components/BreadCrumbs";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;

const siteUrl = "https://hasakeplay.com.vn/news";

export const metadata: Metadata = {
  title: "Tin tức | Hasake Play",
  description:
    "Cập nhật tin tức, dự án mới và câu chuyện từ Hasake Play về giải pháp khu vui chơi.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Tin tức | Hasake Play",
    description:
      "Tin tức và dự án mới về thiết kế, thi công khu vui chơi của Hasake Play.",
    url: siteUrl,
    siteName: "Hasake Play",
    images: [{ url: "/Logo/hasakelogo.png", width: 512, height: 512 }],
  },
};

export default async function NewsListPage({ searchParams }: PageProps) {
  const qs = (await searchParams) || {};
  const page = Number((qs.page as string) || "1");
  const limit = 20; // nới limit để đủ dữ liệu cho carousel

  const { items, total } = await listNews({ page, limit });
  const t = await getTranslations("news");
  const nav = await getTranslations("nav");
  const first = items[0];
  const second = items[1];
  const third = items[2];
  const rest = items.slice(3);
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 6).map((n, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${siteUrl}/${n.slug}`,
      name: n.title,
    })),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-4">
        <NewsBreadcrumbs
          labels={{ home: nav("home"), news: nav("news") }}
          title={undefined}
        />
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
      </header>

      <section className="space-y-6">
        {/* Hàng đầu tiên: 1 lớn bên trái, 2 nhỏ bên phải */}
        {(first || second || third) && (
          <div className="grid gap-3 md:grid-cols-[2fr_1fr] items-start">
            <div className="space-y-3">
              {first ? <NewsCard n={first} variant="large" /> : null}
            </div>
            <div className="grid gap-4">
              {second ? <NewsCard n={second} variant="small" wide /> : null}
              {third ? <NewsCard n={third} variant="small" wide /> : null}
            </div>
          </div>
        )}

        {/* Các bài phía dưới: thẳng hàng đồng nhất */}
        {rest.length > 0 && <NewsCarousel items={rest} perView={5} />}
      </section>
      <Script
        id="news-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />
    </main>
  );
}
