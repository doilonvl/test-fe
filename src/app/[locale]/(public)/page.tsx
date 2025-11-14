/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import path from "path";
import fs from "fs/promises";
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

// Đọc ảnh banner từ /public/Banner_header
async function getSlidesFromPublic() {
  const dir = path.join(process.cwd(), "public", "Banner_header");
  const files = await fs.readdir(dir);
  const images = files
    .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
    .sort();
  return images.map((f) => ({ src: `/Banner_header/${f}` }));
}

// Đọc logo brand từ /public/Brand_marquee
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

  return (
    <main className="min-h-screen">
      {/* HERO / CAROUSEL */}
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

      {/* BRAND MARQUEE */}
      <section className="mx-auto mt-12 max-w-7xl space-y-6 px-4 md:mt-16">
        <FadeIn direction="left">
          <SectionHeading
            eyebrow={t("brandS")}
            title={`${t("brandT")} ${t("brandD")}`}
          />
        </FadeIn>
        <BrandMarquee logos={brandLogos} />
      </section>

      {/* INTRO BLOCKS */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <FadeIn direction="up" once>
          <IntroBlocks />
        </FadeIn>
      </section>

      {/* ABOUT US */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <FadeIn direction="up" once>
          <AboutUs />
        </FadeIn>
      </section>

      {/* LATEST PRODUCTS */}
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
                  <span aria-hidden>→</span>
                </Link>
              }
            />
            <ProjectsGallery data={featuredProjects} variant="marquee" />
          </FadeIn>
        </section>
      ) : null}
    </main>
  );
}
