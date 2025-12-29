/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, getPathname } from "@/i18n/navigation";
import { useGetCatalogsQuery } from "@/services/api";
import GetInTouchSheet from "../forms/GetInTouchSheet";
import LanguageSwitcher from "../LanguageSwitcher";
import { ChevronDown, FileText, Menu } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ProductsMegaMenu from "./ProductsMegaMenu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";

type Tone = "cam" | "bien" | "la";
const toneVars = (which: Tone): CSSProperties => ({
  ["--tone-rgb" as any]:
    which === "cam"
      ? "255,137,5"
      : which === "bien"
      ? "5,172,251"
      : "143,197,66",
});

const linkBase =
  "px-3 py-2 text-[13px] lg:text-sm rounded-lg transition-colors";
const linkHover =
  "hover:bg-[rgba(var(--tone-rgb),0.10)] hover:shadow-[0_8px_20px_-12px_rgba(var(--tone-rgb),0.35)] hover:text-foreground";
const linkIdle = "text-muted-foreground";
const linkActive =
  "bg-[rgba(var(--tone-rgb),0.22)] shadow-[0_8px_22px_-10px_rgba(var(--tone-rgb),0.45)] text-foreground ring-2 ring-[rgba(var(--tone-rgb),0.35)]";

export default function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname() || "/";
  const { data, isLoading } = useGetCatalogsQuery();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const normalize = (p: string) =>
    (p || "/").replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
  const current = normalize(pathname);
  const isAny = (...paths: string[]) =>
    paths.some((p) => {
      const localized = getPathname({ href: p as any, locale }) ?? p;
      const candidates = [localized, p];
      return candidates.some((c) => {
        const target = normalize(c);
        return target === "/"
          ? current === "/" || current === ""
          : current === target || current.startsWith(`${target}/`);
      });
    });
  // helper derive slug nếu backend chưa trả slug
  function deriveSlug(cat: any) {
    const fromPublicId = cat?.pdf?.public_id?.split("/")?.pop();
    if (fromPublicId) return fromPublicId;
    try {
      const u = new URL(cat?.pdf?.url ?? "");
      const tail = (u.pathname.split("/").pop() || "").replace(/\.pdf$/i, "");
      return tail;
    } catch {
      const tail = (
        (cat?.pdf?.url ?? "").split("?")[0].split("/").pop() || ""
      ).replace(/\.pdf$/i, "");
      return tail;
    }
  }

  // Hover-controlled open state for Catalog dropdown
  const [catalogOpen, setCatalogOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const delayedClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setCatalogOpen(false);
      closeTimer.current = null;
    }, 150);
  };
  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const goingDown = y > lastScrollY.current;
      const nearTop = y < 80;

      if (nearTop) {
        setHideOnScroll(false);
      } else if (goingDown && y > 140) {
        setHideOnScroll(true);
      } else if (!goingDown) {
        setHideOnScroll(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/80 border-b py-3 px-3 shadow-[0_6px_12px_-8px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out ${
        hideOnScroll ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="grid w-full items-center min-h-16 grid-cols-[auto_1fr_auto] gap-2">
        {/* Logo */}
        <Link href="/" className="shrink-0 pl-7">
          <span className="relative block h-14 w-[168px]">
            <Image
              src="/Logo/hasakelogo.png"
              alt="HasakePlay"
              fill
              sizes="168px"
              className="object-contain"
              priority
            />
          </span>
        </Link>

        {/* Menu trung tâm */}
        <div className="hidden lg:flex justify-center">
          <ul className="flex items-center gap-6 xl:gap-8 text-[13px] lg:text-sm font-semibold">
            <li>
              <div style={toneVars("cam")}>
                <ProductsMegaMenu
                  label={t("products")}
                  active={isAny("/products", "/san-pham")}
                />
              </div>
            </li>
            <li>
              <Link
                href="/news"
                style={toneVars("bien")}
                className={`${linkBase} ${linkHover} ${
                  isAny("/news", "/tin-tuc") ? linkActive : linkIdle
                }`}
              >
                {t("news")}
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                style={toneVars("la")}
                className={`${linkBase} ${linkHover} ${
                  isAny("/projects", "/du-an") ? linkActive : linkIdle
                }`}
              >
                {t("projects")}
              </Link>
            </li>

            <li>
              <Link
                href="/about-us"
                style={toneVars("cam")}
                className={`${linkBase} ${linkHover} ${
                  isAny("/about-us", "/gioi-thieu") ? linkActive : linkIdle
                }`}
              >
                {t("about")}
              </Link>
            </li>

            <li>
              <div
                className="relative"
                onPointerEnter={() => {
                  clearCloseTimer();
                  setCatalogOpen(true);
                }}
                onPointerLeave={delayedClose}
              >
                <button
                  style={toneVars("bien")}
                  className={`${linkBase} ${linkHover} flex items-center gap-1 ${
                    isAny("/catalogs") ? linkActive : linkIdle
                  } cursor-pointer`}
                  aria-haspopup="menu"
                  aria-expanded={catalogOpen}
                >
                  Catalog
                  <ChevronDown
                    size={15}
                    className={`ml-0.5 opacity-70 transition-transform duration-200 ${
                      catalogOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Panel thả xuống */}
                {catalogOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-2 min-w-[260px] rounded-lg border bg-white shadow-lg ring-1 ring-black/5 p-1"
                  >
                    {isLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Loading…
                      </div>
                    ) : data?.items?.length ? (
                      <ul className="max-h-[60vh] overflow-auto py-1">
                        {data.items.map((cat: any) => {
                          const slug: string | undefined = cat?.slug;
                          if (!slug) return null;
                          const href = `/${locale}/catalogs/${encodeURIComponent(
                            slug
                          )}`;
                          return (
                            <li key={cat._id}>
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#05acfb] rounded-md"
                              >
                                <FileText
                                  size={16}
                                  className="text-[#05acfb]"
                                />
                                <span className="truncate">{cat.title}</span>
                                {cat.year ? (
                                  <span className="ml-1 text-muted-foreground">
                                    ({cat.year})
                                  </span>
                                ) : null}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No catalogs
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
            <li>
              <Link
                href="/privacy"
                style={toneVars("bien")}
                className={`${linkBase} ${linkHover} ${
                  isAny("/privacy", "/bao-mat") ? linkActive : linkIdle
                }`}
              >
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact-us"
                style={toneVars("la")}
                className={`${linkBase} ${linkHover} ${
                  isAny("/contact-us", "/lien-he") ? linkActive : linkIdle
                }`}
              >
                {t("contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Bên phải */}
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <GetInTouchSheet />

          {/* Mobile menu trigger (responsive only) - right corner */}
          {mounted ? (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50 cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[360px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Primary navigation links</SheetDescription>
                </SheetHeader>
                <div className="p-4">
                  <nav>
                    <ul className="space-y-1 text-sm font-semibold">
                      <li>
                        <Link
                          href="/products"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          {t("products")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/news"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          {t("news")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/projects"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          {t("projects")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/about-us"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          {t("about")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/privacy"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          {t("privacy")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/contact-us"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          {t("contact")}
                        </Link>
                      </li>
                      <li className="pt-2 mt-2 border-t">
                        <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-gray-500">
                          Catalog
                        </div>
                        {isLoading ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            Loading…
                          </div>
                        ) : data?.items?.length ? (
                          <ul className="max-h-[55vh] overflow-auto py-1">
                            {data.items.map((cat: any) => {
                              const slug: string | undefined = cat?.slug;
                              if (!slug) return null;
                              const href = `/${locale}/catalogs/${encodeURIComponent(
                                slug
                              )}`;
                              return (
                                <li key={cat._id}>
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    <FileText
                                      size={16}
                                      className="text-[#05acfb]"
                                    />
                                    <span className="truncate">
                                      {cat.title}
                                    </span>
                                    {cat.year ? (
                                      <span className="ml-1 text-muted-foreground">
                                        ({cat.year})
                                      </span>
                                    ) : null}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No catalogs
                          </div>
                        )}
                      </li>
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
