/* eslint-disable @next/next/no-html-link-for-pages */
import path from "path";
import fs from "fs/promises";
import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
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

const siteUrl = "https://hasakeplay.com.vn";

export const metadata: Metadata = {
  title: "Playground Equipment Supplier and Manufacturer",
  description:
    "Hasake Play specialises in the design, supply and installation o...eraction and safety aspects are incorporated in all our designs.",
  keywords: [
    "playground equipment supplier",
    "outdoor playground equipment supplier",
    "playground equipment manufacturers",
    "EPDM rubber flooring manufacturers",
    "EPDM rubber flooring supplier",
    "outdoor fitness playground equipment",
    "Outdoor Children's Play Park Equipment",
    "Kids Outdoor Multiplay Equipment",
    "water park play equipment supplier",
    "bowling equipment supplier",
    "Indoor Bowling Manufacturer",
    "Selling Playground Equipment",
    "Amusement Park Equipment",
    "school playground equipment",
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Playground Equipment Supplier and Manufacturer",
    description:
      "Hasake Play specialises in the design, supply and installation o...eraction and safety aspects are incorporated in all our designs.",
    url: siteUrl,
    siteName: "Hasake Play",
    images: [{ url: "/Logo/hasakelogo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playground Equipment Supplier and Manufacturer",
    description:
      "Hasake Play specialises in the design, supply and installation o...eraction and safety aspects are incorporated in all our designs.",
    images: ["/Logo/hasakelogo.png"],
  },
};
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-slate-100" />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-6 mx-auto max-w-5xl px-4 text-white">
          <h1 className="text-2xl md:text-4xl font-semibold font-caladea">
            {t("heroTitle")}
          </h1>
          <p className="mt-2 opacity-90">{t("heroDesc")}</p>
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
