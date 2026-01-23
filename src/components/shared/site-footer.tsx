/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  Twitter,
  ArrowUpRight,
} from "lucide-react";
import FadeIn from "../animation/FadeIn";

type Office = {
  title: string;
  address: string;
  phones?: string[];
  email?: string;
  mapHref?: string;
};

export default function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const startYear = 2014;
  const isEn = (locale || "vi").toLowerCase().startsWith("en");
  const copyrightText = isEn
    ? `© ${startYear}-${year} Hasake Co., Ltd. All rights reserved.`
    : `© ${startYear}-${year} Công ty TNHH Hasake. Tất cả các quyền được bảo lưu.`;

  const offices: Office[] = [
    {
      title: t("hcm.title"),
      address: t("hcm.address"),
      phones: ["+84 28 3931 9092", "+84 24 3201 9196"],
      email: "info@hasakeplay.com.vn",
      mapHref:
        "https://maps.google.com/?q=T%E1%BA%A7ng%205%2C%2027K%20Tr%E1%BA%A7n%20Nh%E1%BA%ADt%20Du%E1%BA%ADt%2C%20T%C3%A2n%20%C4%90%E1%BB%8Bnh%2C%20Qu%E1%BA%ADn%201%2C%20TPHCM",
    },
    {
      title: t("hanoi.title"),
      address: t("hanoi.address"),
      phones: ["+84 305 335 723"],
      email: "info@hasakeplay.com.vn",
      mapHref:
        "https://maps.google.com/?q=62%20Ng.%20Y%E1%BA%BFt%20Ki%E1%BB%81u%2C%20C%E1%BB%ADa%20Nam%2C%20Ho%C3%A0n%20Ki%E1%BA%BFm%2C%20TP%20H%C3%A0%20N%E1%BB%99i",
    },
    {
      title: t("thailand.title"),
      address: t("thailand.address"),
      phones: ["+66 2-363 6660", "+66 2-363 6661"],
      mapHref: `https://maps.google.com/?q=${encodeURIComponent(
        t("thailand.address")
      )}`,
    },
    {
      title: t("malaysia.title"),
      address: t("malaysia.address"),
      phones: ["+60 3-58923833"],
      mapHref: `https://maps.google.com/?q=${encodeURIComponent(
        t("malaysia.address")
      )}`,
    },
    {
      title: t("india.title"),
      address: t("india.address"),
      phones: ["+91 8446196895", "+91 8082770191"],
      mapHref: `https://maps.google.com/?q=${encodeURIComponent(
        t("india.address")
      )}`,
    },
  ];

  const quickLabel = isEn ? "Quick links" : "Liên kết nhanh";
  const quickLinks: Array<{
    href: string;
    label: string;
    external?: boolean;
  }> = [
    { href: "/", label: nav("home") },
    { href: "/about-us", label: nav("about") },
    { href: "/products", label: nav("products") },
    { href: "/projects", label: nav("projects") },
    { href: "/news", label: nav("news") },
    { href: "/contact-us", label: nav("contact") },
    { href: "/privacy", label: nav("privacy") },
    {
      href: "https://dropincafe.tawk.help",
      label: t("helpCenter"),
      external: true,
    },
  ];
  const maxOffices = 2;
  const mainOffices = offices.slice(0, maxOffices);
  const hasMoreOffices = offices.length > maxOffices;
  const allOfficesLabel = isEn ? "See all offices" : "Xem tất cả văn phòng";

  return (
    <FadeIn direction="up" once>
      <footer className="mt-16 border-t bg-white">
        <div className="h-1 w-full bg-linear-to-r from-[#ff8905] via-[#05acfb] to-[#8fc542]" />

        <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_auto_0.95fr_auto_1.3fr]">
            {/* Brand + socials */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="/Logo/hasakelogo.png"
                  alt="Hasake Play"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-sm text-slate-600">{t("contactCompany")}</p>
              <p className="text-sm text-slate-600">{t("contactBoss")}</p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="h-4 w-4 text-slate-500" />
                <a
                  href="mailto:info@hasakeplay.com.vn"
                  className="hover:text-[#05acfb]"
                >
                  info@hasakeplay.com.vn
                </a>
              </div>
              <div className="rounded-xl border p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {t("hotline.label")}
                </p>
                <a
                  href="tel:+84906866262"
                  className="mt-1 block text-xl font-bold text-slate-900 hover:text-[#ff8905]"
                >
                  +84 906 866 262
                </a>
              </div>

              <div className="flex items-center gap-3">
                {[
                  {
                    href: "https://www.facebook.com/hasakevietnam",
                    label: "Facebook",
                    Icon: Facebook,
                  },
                  {
                    href: "https://www.youtube.com/channel/UCCGRqToOdKeMv8Jgl0Rc-VQ",
                    label: "YouTube",
                    Icon: Youtube,
                  },
                  {
                    href: "https://x.com/hasakevietnam",
                    label: "X",
                    Icon: Twitter,
                  },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-slate-100"
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="hidden lg:block h-full w-px bg-slate-200/80"
              aria-hidden
            />

            {/* Quick links */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold">{quickLabel}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                {quickLinks.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50 hover:text-[#05acfb]"
                    >
                      <ArrowUpRight className="h-4 w-4 opacity-60" />
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50 hover:text-[#05acfb]"
                    >
                      <ArrowUpRight className="h-4 w-4 opacity-60" />
                      <span>{item.label}</span>
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              className="hidden lg:block h-full w-px bg-slate-200/80"
              aria-hidden
            />

            {/* Offices */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold">{t("info.title")}</h4>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Offices
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {mainOffices.map((office) => (
                  <div
                    key={office.title}
                    className="rounded-xl border bg-white p-3 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {office.title}
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="grid grid-cols-[auto_1fr] items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                        <span>{office.address}</span>
                      </div>
                      {office.phones?.map((phone) => (
                        <div
                          key={phone}
                          className="grid grid-cols-[auto_1fr] items-start gap-2"
                        >
                          <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
                          <a
                            className="hover:text-[#ff8905]"
                            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                          >
                            {phone}
                          </a>
                        </div>
                      ))}
                      {office.email ? (
                        <div className="grid grid-cols-[auto_1fr] items-start gap-2">
                          <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                          <a
                            className="hover:text-[#05acfb]"
                            href={`mailto:${office.email}`}
                          >
                            {office.email}
                          </a>
                        </div>
                      ) : null}
                      {office.mapHref ? (
                        <div className="grid grid-cols-[auto_1fr] items-start gap-2">
                          <ArrowUpRight className="mt-0.5 h-4 w-4 text-slate-500" />
                          <a
                            href={office.mapHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#05acfb] hover:underline"
                          >
                            {t("viewMap")}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreOffices ? (
                <div className="pt-2">
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#05acfb] hover:underline"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    {allOfficesLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{copyrightText}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/privacy"
                className="text-slate-600 hover:text-[#05acfb] hover:underline"
              >
                {t("links.privacy")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </FadeIn>
  );
}





