/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { notFound } from "next/navigation";
import { getNewsBySlug, listNews } from "../_data";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import NewsBreadcrumbs from "../_components/BreadCrumbs";
import RelatedNews from "../_components/RelatedNews";
import { buildPageMetadata, mergeKeywords } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const normalizeLocale = (value: string | undefined) =>
  value && value.toLowerCase().startsWith("en") ? "en" : "vi";

const pickLocalizedField = (
  entity: any,
  localeKey: string,
  field: "title" | "excerpt" | "content"
) => {
  if (!entity) return "";
  const map = entity?.[`${field}_i18n`];
  if (map && typeof map === "object" && map !== null) {
    const localized = (map as Record<string, string | undefined>)[localeKey];
    if (localized) return localized;
  }
  return entity?.[field] || "";
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) return {};
  const localeKey = normalizeLocale(await getLocale());
  const seo = await getTranslations("seo");
  const title = pickLocalizedField(n, localeKey, "title") || n.title;
  const description =
    pickLocalizedField(n, localeKey, "excerpt") || n.excerpt || undefined;
  const industryKeywords = seo.raw("keywords.industry") as string[];
  const fallbackDescription = seo("pages.newsDetail.description");
  return buildPageMetadata({
    title: `${title} | ${seo("pages.newsDetail.titleSuffix")}`,
    description: description || fallbackDescription,
    keywords: mergeKeywords(industryKeywords),
    href: "/news/[slug]",
    params: { slug },
    locale: localeKey,
    image: n.cover || undefined,
  });
}

// ---- Helpers (giá»¯ nguyÃªn/nháº¹ nhÃ ng) ----
function isLikelyHTML(s: string) {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}
function toParagraphs(s: string): string[] | null {
  if (!s) return null;
  const normalized = s.replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;
  if (isLikelyHTML(normalized)) return null;

  if (/\n{2,}/.test(normalized)) {
    return normalized
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  const sentences = normalized.split(/(?<=[.!?])\s+(?=[\p{L}\p{N}])/u);
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paras.push([sentences[i], sentences[i + 1]].filter(Boolean).join(" "));
  }
  return paras;
}
function plainText(s: string) {
  return s.replace(/<[^>]*>/g, " ");
}
function getReadingTime(content: string) {
  const text = isLikelyHTML(content) ? plainText(content) : content;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const PRODUCT_MARKER = /\[\[product:([^\]|]+)\|([^\]]+)\]\]/g;

const buildProductHref = (locale: string, slug: string) => {
  const segments = slug
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));
  const fallbackBase = locale === "vi" ? "/san-pham" : "/en/products";
  return segments.length
    ? `${fallbackBase}/${segments.join("/")}`
    : fallbackBase;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const replaceProductMarkers = (value: string, locale: string) =>
  value.replace(PRODUCT_MARKER, (_match, slug, label) => {
    const href = buildProductHref(locale, slug);
    const safeHref = escapeHtml(href);
    const safeLabel = escapeHtml(label);
    return `<a href="${safeHref}" class="text-primary underline underline-offset-2">${safeLabel}</a>`;
  });

const renderTextWithProductLinks = (value: string, locale: string) => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of value.matchAll(PRODUCT_MARKER)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(value.slice(lastIndex, index));
    }
    const slug = match[1];
    const label = match[2];
    const href = buildProductHref(locale, slug);
    nodes.push(
      <a
        key={`${slug}-${index}`}
        href={href}
        className="text-primary underline underline-offset-2"
      >
        {label}
      </a>
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }
  return nodes;
};

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) notFound();
  const localeKey = normalizeLocale(await getLocale());
  const t = await getTranslations("news");
  const nav = await getTranslations("nav");
  const title = pickLocalizedField(n, localeKey, "title") || n.title;
  const excerpt =
    pickLocalizedField(n, localeKey, "excerpt") || n.excerpt || "";
  const content =
    pickLocalizedField(n, localeKey, "content") || n.content || "";

  const dateStr = n.publishedAt
    ? new Date(n.publishedAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const readingMins = getReadingTime(content);
  const paragraphs = toParagraphs(content);
  const htmlContent = isLikelyHTML(content)
    ? replaceProductMarkers(content, localeKey)
    : "";
  const { items: newsItems } = await listNews({ page: 1, limit: 12 });
  const relatedNews = newsItems.filter((item) => item.slug !== n.slug);

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-10 space-y-6"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <header className="space-y-4">
        <NewsBreadcrumbs
          labels={{ home: nav("home"), news: nav("news") }}
          title={title}
        />
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
        <div className="space-y-3">
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight supports-[text-wrap:balance]:text-balance"
            itemProp="headline"
          >
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {dateStr ? (
              <time itemProp="datePublished" dateTime={n.publishedAt}>
                {dateStr}
              </time>
            ) : null}
            {dateStr ? <span aria-hidden>|</span> : null}
            <span>{readingMins} min read</span>
          </div>
        </div>
      </header>
      {n.cover ? (
        <figure className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-gray-50">
            <Image
              src={n.cover}
              alt={n.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
          {excerpt ? (
            <figcaption className="mt-2 text-lg text-gray-500">
              {excerpt}
            </figcaption>
          ) : null}
          <meta itemProp="image" content={n.cover} />
        </figure>
      ) : null}
      {/* 
        Typography tinh chá»‰nh:
        - prose-p:indent-* => lÃ¹i Ä‘áº§u dÃ²ng cho má»—i Ä‘oáº¡n
        - [&_li>p]:indent-0 vÃ  [&_blockquote>p]:indent-0 => khÃ´ng lÃ¹i trong list/blockquote
        - text-wrap:pretty Ä‘á»ƒ ngáº¯t dÃ²ng Ä‘áº¹p
      */}
      <article
        className="prose prose-neutral max-w-none
                   prose-p:leading-relaxed
                   prose-p:indent-6 sm:prose-p:indent-8 lg:prose-p:indent-10
                   [&_li>p]:indent-0 [&_blockquote>p]:indent-0
                   prose-img:rounded-lg prose-a:underline-offset-2
                   prose-blockquote:border-l-4 prose-blockquote:border-gray-300
                   prose-li:marker:text-gray-500
                   [text-wrap:pretty]"
      >
        {paragraphs ? (
          paragraphs.map((p, i) => (
            <p key={i}>{renderTextWithProductLinks(p, localeKey)}</p>
          ))
        ) : content ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : null}
      </article>

      {relatedNews.length ? (
        <RelatedNews
          title={t("relatedTitle")}
          items={relatedNews}
          localeKey={localeKey}
        />
      ) : null}
      <meta itemProp="url" content={`/news/${n.slug}`} />
    </main>
  );
}
