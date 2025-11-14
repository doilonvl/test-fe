// src/app/[locale]/(public)/projects/[slug]/page.tsx
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { fetchProjectBySlug } from "../_data";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Calendar, Building2, Briefcase } from "lucide-react";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug?: string }> };

export default async function ProjectDetail({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();
  const p = await fetchProjectBySlug(slug);
  if (!p) notFound();

  const tNav = await getTranslations("nav");
  const tProj = await getTranslations("projects");

  const cover = p.images?.[0];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Top accent */}
      <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />

      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{tNav("home")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">{tProj("title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[240px]">
              {p.project}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero / Title */}
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {p.project}
        </h1>

        {/* Meta chips */}
        <ul className="flex flex-wrap items-center gap-2">
          <li className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 px-3 py-1 text-sm text-gray-800 ring-1 ring-black/5">
            <Briefcase className="size-4" aria-hidden />
            <span>
              <strong className="font-semibold">
                {tProj("detail.scope")}:
              </strong>{" "}
              {p.scope}
            </span>
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 px-3 py-1 text-sm text-gray-800 ring-1 ring-black/5">
            <Building2 className="size-4" aria-hidden />
            <span>
              <strong className="font-semibold">
                {tProj("detail.client")}:
              </strong>{" "}
              {p.client}
            </span>
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 px-3 py-1 text-sm text-gray-800 ring-1 ring-black/5">
            <Calendar className="size-4" aria-hidden />
            <span>
              <strong className="font-semibold">{tProj("detail.year")}:</strong>{" "}
              {p.yearText ?? p.year}
            </span>
          </li>
        </ul>
      </header>
      {/* Gallery */}
      <section aria-label={tProj("detail.gallery")} className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {tProj("detail.galleryTitle") ?? "Hình ảnh dự án"}
        </h2>

        {p.images?.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {p.images.map((img, i) => (
              <li key={i} className="group relative">
                {/* Gradient border + glass card */}
                <div className="rounded-xl bg-gradient-to-br from-[#ff8905]/35 via-[#05acfb]/35 to-[#8fc542]/35 p-[1.2px]">
                  <figure className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_50px_-15px_rgba(0,0,0,0.5)]">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative h-44 sm:h-48 md:h-52">
                        <img
                          src={img.url}
                          alt={img.alt ?? ""}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.05]"
                          loading="lazy"
                        />
                        {/* Ambient blurred glow on hover */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background:
                              "radial-gradient(1200px 180px at 50% 0%, rgba(255,137,5,0.06), rgba(5,172,251,0.06), rgba(143,197,66,0.06) 60%, transparent 80%)",
                          }}
                        />
                        {/* Micro CTA */}
                        <div className="absolute bottom-2 right-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-medium text-gray-800 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
                            Mở ảnh
                          </span>
                        </div>
                      </div>
                      {img.alt ? (
                        <figcaption className="px-3 py-2 text-lg text-muted-foreground line-clamp-1">
                          {img.alt}
                        </figcaption>
                      ) : null}
                    </a>
                  </figure>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{tProj("detail.noImages")}</p>
        )}
      </section>
    </main>
  );
}
