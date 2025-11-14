/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useId, type MouseEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import FadeIn from "../animation/FadeIn";
type AboutUsProps = {
  aboutImageSrc?: string;
};

export default function AboutUs({
  aboutImageSrc = "/Intro_home/playground1.jpg",
}: AboutUsProps) {
  const t = useTranslations("aboutUs");
  const tabs = ["about", "season", "bowling", "water"] as const;

  const [active, setActive] = useState<(typeof tabs)[number]>("about");
  const groupId = useId();

  const onClickTab = (
    e: MouseEvent<HTMLButtonElement>,
    k: (typeof tabs)[number]
  ) => {
    e.preventDefault();
    setActive(k);
  };

  const onKeyTabs = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t === active);
    const nextIndex =
      e.key === "ArrowRight"
        ? (i + 1) % tabs.length
        : (i - 1 + tabs.length) % tabs.length;
    setActive(tabs[nextIndex]);
  };

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-5 scroll-mt-28">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center md:text-left">
          {t("heading.prefix")}{" "}
          <span className="text-primary">{t("heading.highlight")}</span>
        </h2>
      </div>

      {/* Tabs header (custom) */}
      <div
        role="tablist"
        aria-label="AboutUs tabs"
        onKeyDown={onKeyTabs}
        className="w-full overflow-x-auto flex items-center justify-start gap-0 rounded-xl border p-2"
      >
        {tabs.map((key, idx) => {
          const selected = active === key;
          return (
            <div key={key} className="flex items-center">
              <button
                role="tab"
                aria-selected={selected}
                aria-controls={`${groupId}-panel-${key}`}
                id={`${groupId}-tab-${key}`}
                onClick={(e) => onClickTab(e, key)}
                tabIndex={selected ? 0 : -1}
                className={[
                  "inline-flex h-10 min-w-[120px] items-center justify-center px-3 py-2",
                  "text-sm font-semibold text-center rounded-lg transition-colors",
                  "hover:text-n-700",
                  selected ? "text-p-900" : "text-muted-foreground",
                ].join(" ")}
              >
                <span className="hidden sm:inline">{t(`tabs.${key}`)}</span>
                <span className="sm:hidden">{shortLabelKey(key, t)}</span>
              </button>

              {/* Gạch dọc ngăn cách giữa các tab */}
              {idx < tabs.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden sm:block w-px h-6 bg-gray-200 mx-2"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Panels */}
      <div className="mt-8">
        {active === "about" && (
          <div
            role="tabpanel"
            aria-labelledby={`${groupId}-tab-about`}
            id={`${groupId}-panel-about`}
            className="w-full"
          >
            <FadeIn direction="up" once>
              <div className="flex flex-col w-full gap-8 md:flex-row md:gap-16">
                {/* media */}
                <div className="w-full my-auto md:w-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aboutImageSrc}
                    alt={t("imageAlt")}
                    className="w-full h-[220px] md:h-[550px] md:rounded-tr-[80px] md:rounded-br-[80px] object-cover"
                    loading="lazy"
                  />
                </div>

                {/* content */}
                <div className="w-full my-auto md:w-1/2">
                  <h3 className="text-3xl font-bold capitalize lg:text-4xl text-center md:text-left">
                    {t("about.title")}
                  </h3>
                  <p className="max-w-xl mt-2">{t("about.p1")}</p>
                  <p className="max-w-xl mt-2">{t("about.p2")}</p>
                  <p className="max-w-xl mt-2">{t("about.p3")}</p>
                  <p className="max-w-xl mt-2">{t("about.p4")}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {active === "season" && (
          <div
            role="tabpanel"
            aria-labelledby={`${groupId}-tab-season`}
            id={`${groupId}-panel-season`}
            className="w-full"
          >
            <FadeIn direction="up" once>
              <div className="flex flex-col w-full gap-8 md:flex-row md:gap-16">
                {/* media */}
                <div className="w-full my-auto md:w-1/2">
                  <video
                    src="https://res.cloudinary.com/dm0fuut1j/video/upload/v1762920161/hasake/videos/season-avanue.mp4"
                    className="w-full h-[220px] md:h-[550px] md:rounded-tr-[80px] md:rounded-br-[80px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    aria-label={t("season.videoAria")}
                  />
                </div>
                {/* content */}
                <div className="w-full my-auto md:w-1/2">
                  <h3 className="font-caladea text-3xl font-bold capitalize lg:text-4xl text-center md:text-left">
                    {t("season.title")}
                  </h3>
                  <p className="max-w-xl mt-2">{t("season.p1")}</p>
                  <p className="max-w-xl mt-2">{t("season.p2")}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {active === "bowling" && (
          <div
            role="tabpanel"
            aria-labelledby={`${groupId}-tab-bowling`}
            id={`${groupId}-panel-bowling`}
            className="w-full"
          >
            <FadeIn direction="down" once>
              <div className="flex flex-col w-full gap-8 md:flex-row md:gap-16">
                {/* media */}
                <div className="w-full my-auto md:w-1/2">
                  <video
                    src="https://res.cloudinary.com/dm0fuut1j/video/upload/v1762920156/hasake/videos/green-bowling.mp4"
                    className="w-full h-[220px] md:h-[550px] md:rounded-tr-[80px] md:rounded-br-[80px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    aria-label={t("bowling.videoAria")}
                  />
                </div>
                {/* content */}
                <div className="w-full my-auto md:w-1/2">
                  <h3 className="font-caladea text-3xl font-bold capitalize lg:text-4xl text-center md:text-left">
                    {t("bowling.title")}
                  </h3>
                  <p className="max-w-xl mt-2">{t("bowling.p1")}</p>
                  <p className="max-w-xl mt-2">{t("bowling.p2")}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {active === "water" && (
          <div
            role="tabpanel"
            aria-labelledby={`${groupId}-tab-water`}
            id={`${groupId}-panel-water`}
            className="w-full"
          >
            <FadeIn direction="up" once>
              <div className="flex flex-col w-full gap-8 md:flex-row md:gap-16">
                {/* media */}
                <div className="w-full my-auto md:w-1/2">
                  <video
                    src="https://res.cloudinary.com/dm0fuut1j/video/upload/v1762920163/hasake/videos/ssr-pmh.mp4"
                    className="w-full h-[220px] md:h-[550px] md:rounded-tr-[80px] md:rounded-br-[80px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    aria-label={t("water.videoAria")}
                  />
                </div>
                {/* content */}
                <div className="w-full my-auto md:w-1/2">
                  <h3 className="font-caladea text-3xl font-bold capitalize lg:text-4xl text-center md:text-left">
                    {t("water.title")}
                  </h3>
                  <p className="max-w-xl mt-2">{t("water.p1")}</p>
                  <p className="max-w-xl mt-2">{t("water.p2")}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </section>
  );
}

function shortLabelKey(
  key: "about" | "season" | "bowling" | "water",
  t: ReturnType<typeof useTranslations>
) {
  return t(`tabs.${key}Short`);
}
