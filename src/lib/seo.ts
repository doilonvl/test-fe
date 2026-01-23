/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";

const SITE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.hasakeplay.com.vn"
).replace(/\/$/, "");

const resolvePathname = ({
  href,
  locale,
  params,
}: {
  href: string;
  locale: string;
  params?: Record<string, string>;
}) => {
  if (href.includes("[") && (!params || Object.keys(params).length === 0)) {
    return href || "/";
  }
  try {
    const resolved = getPathname({ href, locale, params } as any);
    if (resolved) return resolved;
  } catch {
    // fall back to href for unresolved dynamic routes
  }
  return href || "/";
};

export const buildAbsoluteUrl = (pathname: string) =>
  new URL(pathname || "/", SITE_BASE).toString();

export const buildAlternates = ({
  href,
  locale,
  params,
}: {
  href: string;
  locale: string;
  params?: Record<string, string>;
}) => {
  const canonicalPath = resolvePathname({ href, locale, params });
  return {
    canonical: buildAbsoluteUrl(canonicalPath),
    languages: {
      en: buildAbsoluteUrl(resolvePathname({ href, locale: "en", params })),
      vi: buildAbsoluteUrl(resolvePathname({ href, locale: "vi", params })),
    },
  };
};

export const mergeKeywords = (
  ...lists: Array<string[] | undefined | null>
) => {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const value = (raw || "").trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(value);
    }
  }
  return merged;
};

export const buildPageMetadata = ({
  title,
  description,
  keywords,
  href,
  locale,
  params,
  image,
}: {
  title: string;
  description?: string;
  keywords?: string[];
  href: string;
  locale: string;
  params?: Record<string, string>;
  image?: string;
}): Metadata => {
  const alternates = buildAlternates({ href, locale, params });
  const canonical = alternates.canonical as string;
  const metaTitle = title.trim();
  const metaDescription = description?.trim();
  const metaImage = image || "/Logo/hasakelogo.png";

  return {
    title: metaTitle,
    description: metaDescription || undefined,
    keywords: keywords && keywords.length ? keywords : undefined,
    alternates,
    openGraph: {
      title: metaTitle,
      description: metaDescription || undefined,
      url: canonical,
      siteName: "Hasake Play",
      images: [{ url: metaImage, width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription || undefined,
      images: [metaImage],
    },
  };
};
