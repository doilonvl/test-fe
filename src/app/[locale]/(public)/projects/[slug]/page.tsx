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
import ProjectImages from "../_components/ProjectImages";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug?: string }> };

export default async function ProjectDetail({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();
  const p = await fetchProjectBySlug(slug);
  if (!p) notFound();

  const tNav = await getTranslations("nav");
  const tProj = await getTranslations("projects");

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

      {/* Gallery with lightbox */}
      <section aria-label={tProj("detail.gallery")} className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {tProj("detail.galleryTitle") ?? "Hình ảnh dự án"}
        </h2>

        {p.images?.length ? (
          <ProjectImages
            images={p.images}
            projectName={p.project}
            projectSlug={p.slug ?? p._id}
            emptyText={tProj("detail.noImages")}
          />
        ) : (
          <p className="text-muted-foreground">{tProj("detail.noImages")}</p>
        )}
      </section>
    </main>
  );
}
