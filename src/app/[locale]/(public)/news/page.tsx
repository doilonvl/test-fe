/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Script from "next/script";
import { listNews } from "./_data";
import { getLocale, getTranslations } from "next-intl/server";
import NewsCard from "./_components/NewsCard";
// Removed paginate in favor of a slider for row 2
import NewsCarousel from "./_components/Carousel";
import NewsBreadcrumbs from "./_components/BreadCrumbs";
import { buildAbsoluteUrl, buildPageMetadata, mergeKeywords } from "@/lib/seo";
import { getPathname } from "@/i18n/navigation";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getTranslations("seo");
  const locale = await getLocale();
  const industryKeywords = seo.raw("keywords.industry") as string[];
  return buildPageMetadata({
    title: seo("pages.news.title"),
    description: seo("pages.news.description"),
    keywords: mergeKeywords(industryKeywords),
    href: "/news",
    locale,
  });
}

export default async function NewsListPage({ searchParams }: PageProps) {
  const qs = (await searchParams) || {};
  const page = Number((qs.page as string) || "1");
  const limit = 20; // nới limit để đủ dữ liệu cho carousel

  const { items, total } = await listNews({ page, limit });
  const t = await getTranslations("news");
  const nav = await getTranslations("nav");
  const locale = await getLocale();
  const first = items[0];
  const second = items[1];
  const third = items[2];
  const rest = items.slice(3);
  const basePath = getPathname({ href: "/news", locale }) ?? "/news";
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 6).map((n, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: n.slug
        ? buildAbsoluteUrl(`${basePath}/${encodeURIComponent(n.slug)}`)
        : buildAbsoluteUrl(basePath),
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
