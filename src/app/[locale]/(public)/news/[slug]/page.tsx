/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "../_data";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import NewsBreadcrumbs from "../_components/BreadCrumbs";

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
  const title = pickLocalizedField(n, localeKey, "title") || n.title;
  const description =
    pickLocalizedField(n, localeKey, "excerpt") || n.excerpt || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: n.cover ? [{ url: n.cover }] : undefined,
    },
  };
}

// ---- Helpers (giữ nguyên/nhẹ nhàng) ----
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

  const sentences = normalized.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ỵ0-9])/u);
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

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) notFound();
  const localeKey = normalizeLocale(await getLocale());
  const t = await getTranslations("news");
  const title = pickLocalizedField(n, localeKey, "title") || n.title;
  const excerpt = pickLocalizedField(n, localeKey, "excerpt") || n.excerpt || "";
  const content = pickLocalizedField(n, localeKey, "content") || n.content || "";

  const dateStr = n.publishedAt
    ? new Date(n.publishedAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const readingMins = getReadingTime(content);
  const paragraphs = toParagraphs(content);

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-10 space-y-6"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <NewsBreadcrumbs
        labels={{ home: "Home", news: t("title") }}
        title={title}
      />

      <header className="space-y-3">
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
          {dateStr ? <span aria-hidden>•</span> : null}
          <span>{readingMins} min read</span>
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
        Typography tinh chỉnh:
        - prose-p:indent-* => lùi đầu dòng cho mỗi đoạn
        - [&_li>p]:indent-0 và [&_blockquote>p]:indent-0 => không lùi trong list/blockquote
        - text-wrap:pretty để ngắt dòng đẹp
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
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : null}
      </article>

      <meta itemProp="url" content={`/news/${n.slug}`} />
    </main>
  );
}
