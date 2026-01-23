/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/[locale]/(public)/projects/[slug]/page.tsx
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { fetchProjectBySlug, fetchProjects } from "../_data";
import { getLocale, getTranslations } from "next-intl/server";
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
import RelatedProjects from "../_components/RelatedProjects";
import BeforeAfterSlider from "../_components/BeforeAfterSlider";
import type { Metadata } from "next";
import { buildPageMetadata, mergeKeywords } from "@/lib/seo";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug?: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return {};
  const project = await fetchProjectBySlug(slug);
  if (!project) return {};
  const seo = await getTranslations("seo");
  const locale = await getLocale();
  const industryKeywords = seo.raw("keywords.industry") as string[];
  const firstImage = project.images?.[0];
  const image =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url;
  return buildPageMetadata({
    title: `${project.project} | ${seo("pages.projectsDetail.titleSuffix")}`,
    description:
      project.scope ||
      seo("pages.projectsDetail.description"),
    keywords: mergeKeywords(industryKeywords),
    href: "/projects/[slug]",
    params: { slug },
    locale,
    image,
  });
}

export default async function ProjectDetail({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();
  const p = await fetchProjectBySlug(slug);
  if (!p) notFound();

  const tNav = await getTranslations("nav");
  const tProj = await getTranslations("projects");
  const { items: projectItems } = await fetchProjects({ page: 1, limit: 12 });
  const relatedProjects = projectItems.filter((item) => item._id !== p._id);

  const pickImage = (value: any) => {
    if (!value) return null;
    if (typeof value === "string") return { url: value };
    if (typeof value === "object") {
      const url = value.url || value.src;
      if (url) return { url, alt: value.alt };
    }
    return null;
  };

  const challenge =
    (p as any).challenge ||
    (p as any).problem ||
    (p as any).constraints ||
    "";
  const solution =
    (p as any).solution || (p as any).approach || (p as any).design || "";
  const result =
    (p as any).result || (p as any).outcome || (p as any).impact || "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
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
              <Link href="/projects">{tNav("projects")}</Link>
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

      {/* Top accent */}
      <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />

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

      {challenge || solution || result ? (
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {tProj("caseStudy.eyebrow")}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {tProj("caseStudy.title")}
            </h2>
            <p className="text-sm text-slate-600">
              {tProj("caseStudy.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CaseBlock
              title={tProj("caseStudy.challenge")}
              content={challenge}
            />
            <CaseBlock
              title={tProj("caseStudy.solution")}
              content={solution}
            />
            <CaseBlock title={tProj("caseStudy.result")} content={result} />
          </div>
        </section>
      ) : null}

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

      {relatedProjects.length ? (
        <RelatedProjects
          title={tProj("relatedTitle")}
          items={relatedProjects}
        />
      ) : null}
    </main>
  );
}

function CaseBlock({ title, content }: { title: string; content: string }) {
  if (!content) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-sm text-slate-400">...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-700">{content}</p>
    </div>
  );
}
