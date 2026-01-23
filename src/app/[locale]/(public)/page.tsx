/* eslint-disable @next/next/no-html-link-for-pages */
import path from "path";
import fs from "fs/promises";
import type { Metadata } from "next";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import HeroCarousel from "@/components/home/HeroCarousel";
import BrandMarquee from "@/components/BrandMarquee";
import FadeIn from "@/components/animation/FadeIn";
import LatestProducts from "@/components/home/LatestProduct";
import IntroBlocks from "@/components/home/IntroBlock";
import AboutUs from "@/components/shared/AboutUs";
import ProjectsGallery from "./projects/_components/Gallery";
import { fetchProjects } from "./projects/_data";
import { buildGalleryProjects } from "./projects/_lib/gallery";
import { Link } from "@/i18n/navigation";
import SectionHeading from "@/components/home/SectionHeading";
import { buildPageMetadata, mergeKeywords } from "@/lib/seo";

const siteUrl = "https://hasakeplay.com.vn";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getTranslations("seo");
  const locale = await getLocale();
  const industryKeywords = seo.raw("keywords.industry") as string[];
  return buildPageMetadata({
    title: seo("pages.home.title"),
    description: seo("pages.home.description"),
    keywords: mergeKeywords(industryKeywords),
    href: "/",
    locale,
  });
}
async function getSlidesFromPublic() {
  const dir = path.join(process.cwd(), "public", "Banner_header");
  const files = await fs.readdir(dir);
  const images = files
    .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
    .sort();
  return images.map((f) => ({ src: `/Banner_header/${f}` }));
}

async function getBrandLogos() {
  const dir = path.join(process.cwd(), "public", "Brand_marquee");
  const files = await fs.readdir(dir);
  const logos = files
    .filter((f) => /\.(png|jpe?g|webp|avif|svg)$/i.test(f))
    .sort();
  return logos.map((f) => ({
    src: `/Brand_marquee/${f}`,
    alt: f.replace(/\.\w+$/, ""),
  }));
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const slides = await getSlidesFromPublic();
  const brandLogos = await getBrandLogos();
  const projectsRes = await fetchProjects();
  const featuredProjects = await buildGalleryProjects(
    projectsRes.items ?? [],
    18
  );

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hasake Play",
    url: siteUrl,
    logo: `${siteUrl}/Logo/hasakelogo.png`,
    sameAs: [
      "https://www.facebook.com/hasakeplay",
      "https://www.instagram.com/hasakeplay",
    ],
  };

  const projectsLd =
    featuredProjects.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: featuredProjects.slice(0, 6).map((p, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: p.project,
            url: `${siteUrl}/projects/${p.slug || p._id}`,
          })),
        }
      : null;

  return (
    <main className="min-h-screen">
      <section className="relative">
        <HeroCarousel slides={slides} />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-slate-950/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-10 mx-auto max-w-5xl px-4 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {t("heroEyebrow")}
          </p>
          <h1 className="mt-3 text-2xl md:text-5xl font-semibold font-caladea leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-white/90">
            {t("heroDesc")}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff8905] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-300/40 hover:brightness-110"
            >
              {t("heroPrimaryCta")}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              {t("heroSecondaryCta")}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/80">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              {t("heroBadgeOne")}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              {t("heroBadgeTwo")}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              {t("heroBadgeThree")}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-6xl px-4">
        <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] backdrop-blur md:grid-cols-3">
          {[
            {
              title: t("trust.titleOne"),
              desc: t("trust.descOne"),
            },
            {
              title: t("trust.titleTwo"),
              desc: t("trust.descTwo"),
            },
            {
              title: t("trust.titleThree"),
              desc: t("trust.descThree"),
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 px-4 py-4 text-center"
            >
              <p className="text-lg font-semibold text-slate-900">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl space-y-6 px-4 md:mt-16">
        <FadeIn direction="left">
          <SectionHeading
            eyebrow={t("brandS")}
            title={`${t("brandT")} ${t("brandD")}`}
          />
        </FadeIn>
        <BrandMarquee logos={brandLogos} />
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <FadeIn direction="up" once>
          <IntroBlocks />
        </FadeIn>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <FadeIn direction="up" once>
          <AboutUs />
        </FadeIn>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <FadeIn direction="up" once>
          <LatestProducts limit={4} />
        </FadeIn>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <div className="grid gap-6 rounded-3xl border border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("futureEyebrow")}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              {t("futureTitle")}
            </h2>
            <p className="text-sm text-slate-600 md:text-base">
              {t("futureDesc")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: t("futureCards.inclusive.title"),
                desc: t("futureCards.inclusive.desc"),
              },
              {
                title: t("futureCards.green.title"),
                desc: t("futureCards.green.desc"),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredProjects.length ? (
        <section className="mx-auto mt-12 max-w-7xl space-y-4 px-4 md:mt-16">
          <FadeIn direction="up" once>
            <SectionHeading
              title={t("featuredProjectsTitle")}
              description={t("featuredProjectsSubtitle")}
              action={
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:border-[#05acfb]"
                >
                  {t("featuredProjectsCTA")}
                  <span aria-hidden>{">"}</span>
                </Link>
              }
            />
            <ProjectsGallery data={featuredProjects} variant="marquee" />
          </FadeIn>
        </section>
      ) : null}

      <Script
        id="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      {projectsLd ? (
        <Script
          id="projects-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsLd) }}
        />
      ) : null}
    </main>
  );
}
