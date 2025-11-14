/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname, pathnames } from "@/i18n/navigation";
import type { Locale } from "@/i18n/request";
import { useParams, useSearchParams } from "next/navigation";

import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type QueryObject = Record<string, string | string[]>;
type PathnameKey = keyof typeof pathnames;

const getLocalizedPathname = (key: PathnameKey, locale: Locale) => {
  const value = pathnames[key];
  return typeof value === "string" ? value : value[locale];
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = useLocale() as Locale;
  const params = useParams();
  const searchParams = useSearchParams();

  const queryObject = useMemo<QueryObject | undefined>(() => {
    if (!searchParams) return undefined;
    const map = new Map<string, string[]>();
    searchParams.forEach((value, key) => {
      const current = map.get(key) ?? [];
      current.push(value);
      map.set(key, current);
    });

    if (map.size === 0) return undefined;
    const result: QueryObject = {};
    map.forEach((values, key) => {
      result[key] = values.length === 1 ? values[0] : values;
    });
    return result;
  }, [searchParams]);

  const routeParams = useMemo<
    Record<string, string | string[]> | undefined
  >(() => {
    if (!params) return undefined;
    const { locale: _localeParam, ...rest } = params as Record<
      string,
      string | string[]
    >;
    const entries = Object.entries(rest);
    if (entries.length === 0) return undefined;
    return entries.reduce<Record<string, string | string[]>>(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {}
    );
  }, [params]);

  const localeLessPath = useMemo(() => {
    const prefix = `/${locale}`;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) {
      const nextPath = pathname.slice(prefix.length);
      return nextPath.length === 0 ? "/" : nextPath;
    }
    return pathname;
  }, [pathname, locale]);

  const segmentsHref = useMemo(() => {
    const segments = routeParams?.segments;
    if (Array.isArray(segments) && segments.length > 0) {
      return {
        pathname: "/products/[[...segments]]" as const,
        params: { segments },
      };
    }
    return undefined;
  }, [routeParams]);

  const slugHref = useMemo(() => {
    const slug = typeof routeParams?.slug === "string" ? routeParams.slug : "";
    if (!slug) return undefined;

    const matchers: Array<{
      key: PathnameKey;
      prefixes: string[];
    }> = [
      { key: "/products/[slug]", prefixes: ["/products/", "/san-pham/"] },
      { key: "/news/[slug]", prefixes: ["/news/", "/tin-tuc/"] },
      { key: "/projects/[slug]", prefixes: ["/projects/", "/du-an/"] },
      { key: "/catalogs/[slug]", prefixes: ["/catalogs/"] },
    ];

    const matched = matchers.find(({ prefixes }) =>
      prefixes.some((prefix) => localeLessPath.startsWith(prefix))
    );

    if (!matched) return undefined;
    return {
      pathname: matched.key,
      params: { slug },
    };
  }, [routeParams, localeLessPath, locale]);

  const staticHref = useMemo(() => {
    return (Object.keys(pathnames) as PathnameKey[]).find(
      (key) => getLocalizedPathname(key, locale) === localeLessPath
    );
  }, [localeLessPath, locale]);

  const resolvedHref = segmentsHref ?? slugHref ?? staticHref ?? undefined;

  const [hash, setHash] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHash(window.location.hash || "");
    }
  }, []);

  const goLocale = (target: Locale) => {
    const hrefBase =
      resolvedHref === undefined
        ? { pathname }
        : typeof resolvedHref === "string"
        ? { pathname: resolvedHref }
        : resolvedHref;

    const hrefWithQuery = queryObject
      ? { ...hrefBase, query: queryObject }
      : hrefBase;

    router.replace(hrefWithQuery as any, { locale: target });

    if (hash) {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.hash = hash;
        }
      }, 0);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change language"
          className="cursor-pointer"
          title={locale === "vi" ? "Tieng Viet" : "English"}
        >
          <Globe className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => goLocale("vi")}
          className="flex justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            Tieng Viet
            <img
              src="/Flag/vn.png"
              alt="Vietnamese"
              className="h-6 w-6 rounded-[3px] object-cover"
            />
          </span>
          {locale === "vi" ? <Check className="size-4" /> : null}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => goLocale("en")}
          className="flex justify-between cursor-pointer"
        >
          <span className="flex items-center gap-6">
            English
            <img
              src="/Flag/usa.png"
              alt="English"
              className="h-6 w-6 rounded-[3px] object-cover"
            />
          </span>
          {locale === "en" ? <Check className="size-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
