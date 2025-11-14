/* eslint-disable @next/next/no-img-element */
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Facebook, Youtube, Twitter } from "lucide-react";
import FadeIn from "../animation/FadeIn";

export default function SiteFooter() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const startYear = 2014;
  // Build copyright text manually to avoid ICU parsing issues in some environments
  const isEn = (locale || "vi").toLowerCase().startsWith("en");
  const copyrightText = isEn
    ? `© ${startYear}–${year} Hasake Co., Ltd. All rights reserved.`
    : `© ${startYear}–${year} Công ty TNHH Hasake. Tất cả các quyền được bảo lưu.`;

  return (
    <FadeIn direction="up" once>
      <footer className="mt-16 border-t">
        {/* gradient 3 màu theo brand */}
        <div className="h-1 w-full bg-linear-to-r from-[#ff8905] via-[#05acfb] to-[#8fc542]" />

        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Cột 1: logo + hotline + social */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/Logo/hasakelogo.png"
                  alt="Hasake Play"
                  className="h-10 w-auto"
                />
              </div>

              <p className="text-sm text-slate-600">{t("contactCompany")}</p>
              <p className="text-sm text-slate-600">{t("contactBoss")}</p>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold text-slate-500">
                  {t("hotline.label")}
                </p>
                <a
                  href="tel:+84305335723"
                  className="mt-1 block text-lg font-bold text-slate-900 hover:text-[#ff8905]"
                >
                  +84305335723
                </a>
              </div>

              {/* Social */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/hasakevietnam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-[#05acfb]/10"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCCGRqToOdKeMv8Jgl0Rc-VQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-[#ff8905]/10"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/hasakevietnam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-[#8fc542]/10"
                  aria-label="X"
                  title="X"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://maps.google.com/?q=Hasake%20Play"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-slate-100"
                  aria-label="Google Maps"
                  title="Google Maps"
                >
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Cột 2: VP HCM */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold">{t("hcm.title")}</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{t("hcm.address")}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>
                    {t("hcm.phoneHcm")}:&nbsp;
                    <a
                      className="hover:text-[#ff8905]"
                      href="tel:+842839319092"
                    >
                      +84 28 3931 9092
                    </a>
                    <br />
                    {t("hcm.phoneHn")}:&nbsp;
                    <a
                      className="hover:text-[#ff8905]"
                      href="tel:+842432019196"
                    >
                      +84 24 3201 9196
                    </a>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>{t("hcm.fax")}: +84 83 931 9876</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <a
                    className="hover:text-[#05acfb]"
                    href="mailto:info@hasakeplay.com.vn"
                  >
                    info@hasakeplay.com.vn
                  </a>
                </p>
                <p>
                  <a
                    href="https://maps.google.com/?q=T%E1%BA%A7ng%205%2C%2027K%20Tr%E1%BA%A7n%20Nh%E1%BA%ADt%20Du%E1%BA%ADt%2C%20T%C3%A2n%20%C4%90%E1%BB%8Bnh%2C%20Qu%E1%BA%ADn%201%2C%20TPHCM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#05acfb] hover:underline"
                  >
                    {t("viewMap")}
                  </a>
                </p>
              </div>
            </div>

            {/* Cột 3: VP Hà Nội */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold">{t("hanoi.title")}</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{t("hanoi.address")}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <a className="hover:text-[#ff8905]" href="tel:+84305335723">
                    +84305335723
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <a
                    className="hover:text-[#05acfb]"
                    href="mailto:info@hasakeplay.com.vn"
                  >
                    info@hasakeplay.com.vn
                  </a>
                </p>
                <p>
                  <a
                    href="https://maps.google.com/?q=62%20Ng.%20Y%E1%BA%BFt%20Ki%C3%AAu%2C%20C%E1%BB%ADa%20Nam%2C%20Ho%C3%A0n%20Ki%E1%BA%BFm%2C%20TP%20H%C3%A0%20N%E1%BB%99i"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#05acfb] hover:underline"
                  >
                    {t("viewMap")}
                  </a>
                </p>
              </div>
              {/* Malaysia */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold">
                  {t("malaysia.title")}
                </h4>
                <p className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{t("malaysia.address")}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <a className="hover:text-[#ff8905]" href="tel:+60358923833">
                    {t("tel")}: +60 3-58923833
                  </a>
                </p>
                <p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      t("malaysia.address")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#05acfb] hover:underline"
                  >
                    {t("viewMap")}
                  </a>
                </p>
              </div>
            </div>

            {/* Cột 4: Văn phòng quốc tế */}
            <div className="space-y-5">
              {/* Thailand */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold">
                  {t("thailand.title")}
                </h4>
                <p className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{t("thailand.address")}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>
                    {t("tel")}:&nbsp;
                    <a className="hover:text-[#ff8905]" href="tel:+6623636660">
                      +66 2-363 6660
                    </a>
                    <span className="mx-1">/</span>
                    <a className="hover:text-[#ff8905]" href="tel:+6623636661">
                      +66 2-363 6661
                    </a>
                  </span>
                </p>
                <p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      t("thailand.address")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#05acfb] hover:underline"
                  >
                    {t("viewMap")}
                  </a>
                </p>
              </div>

              {/* India */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold">{t("india.title")}</h4>
                <p className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{t("india.address")}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>
                    {t("tel")}:&nbsp;
                    <a
                      className="hover:text-[#ff8905]"
                      href="tel:+918446196895"
                    >
                      +91 8446196895
                    </a>
                    <span className="mx-1">/</span>
                    <a
                      className="hover:text-[#ff8905]"
                      href="tel:+918082770191"
                    >
                      +91 8082770191
                    </a>
                  </span>
                </p>
                <p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      t("india.address")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#05acfb] hover:underline"
                  >
                    {t("viewMap")}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bản quyền */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-slate-500 md:flex-row">
            <p>{copyrightText}</p>
          </div>
        </div>
      </footer>
    </FadeIn>
  );
}
