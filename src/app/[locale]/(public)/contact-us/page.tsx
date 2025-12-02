import InlineContactForm from "@/components/forms/InlineContactForm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Mail, MapPin, Phone, ArrowUpRight, Building2 } from "lucide-react";

export const revalidate = 300;

type Office = {
  key: string;
  title: string;
  address: string;
  phone?: string | string[];
  email?: string;
  mapHref?: string;
  badge?: string;
  mapLabel?: string;
};

export default async function ContactPage() {
  const nav = await getTranslations("nav");
  const contactPage = await getTranslations("contactPage");
  const footer = await getTranslations("footer");
  const mapLabel = footer("viewMap");

  const offices: Office[] = [
    {
      key: "hcm",
      title: footer("hcm.title"),
      address: footer("hcm.address"),
      phone: [
        footer("hcm.phoneHcm") + ": +84 28 3931 9092",
        footer("hcm.phoneHn") + ": +84 24 3201 9196",
      ],
      email: "info@hasakeplay.com.vn",
      mapHref:
        "https://maps.google.com/?q=T%E1%BA%A7ng%205%2C%2027K%20Tr%E1%BA%A7n%20Nh%E1%BA%ADt%20Du%E1%BA%ADt%2C%20T%C3%A2n%20%C4%90%E1%BB%8Bnh%2C%20Qu%E1%BA%ADn%201%2C%20TPHCM",
      badge: contactPage("badges.hq"),
      mapLabel,
    },
    {
      key: "hanoi",
      title: footer("hanoi.title"),
      address: footer("hanoi.address"),
      phone: "+84 305 335 723",
      email: "info@hasakeplay.com.vn",
      mapHref:
        "https://maps.google.com/?q=62%20Ng.%20Y%E1%BA%BFt%20Ki%C3%AAu%2C%20C%E1%BB%ADa%20Nam%2C%20Ho%C3%A0n%20Ki%E1%BA%BFm%2C%20TP%20H%C3%A0%20N%E1%BB%99i",
      badge: contactPage("badges.vietnam"),
      mapLabel,
    },
    {
      key: "thailand",
      title: footer("thailand.title"),
      address: footer("thailand.address"),
      phone: ["+66 2-363 6660", "+66 2-363 6661"],
      mapHref: `https://maps.google.com/?q=${encodeURIComponent(
        footer("thailand.address")
      )}`,
      badge: contactPage("badges.asia"),
      mapLabel,
    },
    {
      key: "malaysia",
      title: footer("malaysia.title"),
      address: footer("malaysia.address"),
      phone: "+60 3-58923833",
      mapHref: `https://maps.google.com/?q=${encodeURIComponent(
        footer("malaysia.address")
      )}`,
      badge: contactPage("badges.asia"),
      mapLabel,
    },
    {
      key: "india",
      title: footer("india.title"),
      address: footer("india.address"),
      phone: ["+91 8446196895", "+91 8082770191"],
      mapHref: `https://maps.google.com/?q=${encodeURIComponent(
        footer("india.address")
      )}`,
      badge: contactPage("badges.global"),
      mapLabel,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-10">
        <Breadcrumb>
          <BreadcrumbList className="text-sm text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{nav("home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                {contactPage("title")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="overflow-hidden rounded-3xl border bg-gradient-to-r from-[#05acfb]/10 via-white to-[#8fc542]/10 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.25)]">
          <div className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700 shadow-sm ring-1 ring-sky-100">
                <Building2 className="h-4 w-4 text-sky-500" />
                {contactPage("eyebrow")}
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                {contactPage("heroTitle")}
              </h1>
              <p className="max-w-2xl text-base text-slate-700 md:text-lg">
                {contactPage("heroSubtitle")}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBadge
                  icon={<Phone className="h-4 w-4" />}
                  label={contactPage("hotline")}
                  value="+84 906 866 262"
                  href="tel:+84906866262"
                  tone="sky"
                />
                <InfoBadge
                  icon={<Mail className="h-4 w-4" />}
                  label={contactPage("email")}
                  value="info@hasakeplay.com.vn"
                  href="mailto:info@hasakeplay.com.vn"
                  tone="amber"
                />
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-sky-100 bg-white/70 p-5 shadow-inner shadow-sky-50">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                {contactPage("ctaTitle")}
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {contactPage("ctaHeadline")}
              </p>
              <p className="text-sm text-slate-600">{contactPage("ctaDesc")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <MiniCard
                  title={contactPage("miniCards.projects.title")}
                  desc={contactPage("miniCards.projects.desc")}
                />
                <MiniCard
                  title={contactPage("miniCards.support.title")}
                  desc={contactPage("miniCards.support.desc")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <InlineContactForm
            heading={contactPage("formTitle")}
            description={contactPage("formSubtitle")}
          />

          <div className="space-y-4 rounded-2xl border bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {contactPage("officesTitle")}
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  {contactPage("officesSubtitle")}
                </h3>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600">
              {contactPage("officesIntro")}
            </p>

            <div className="space-y-3">
              {offices.slice(0, 2).map((office) => (
                <OfficeCard key={office.key} office={office} compact />
              ))}
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {contactPage("officesLabel")}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {contactPage("officesGridTitle")}
              </h2>
              <p className="text-sm text-slate-600">
                {contactPage("officesGridSubtitle")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offices.map((office) => (
              <OfficeCard key={office.key} office={office} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoBadge({
  icon,
  label,
  value,
  href,
  tone = "sky",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  tone?: "sky" | "amber";
}) {
  const toneClass =
    tone === "sky"
      ? "from-[#05acfb]/15 to-[#05acfb]/5 ring-sky-100 text-sky-900"
      : "from-[#ff8905]/15 to-[#ff8905]/5 ring-amber-100 text-amber-900";

  const content = (
    <div
      className={`flex items-start gap-3 rounded-xl bg-gradient-to-br ${toneClass} px-4 py-3 ring-1`}
    >
      <div className="mt-0.5 rounded-full bg-white/70 p-2 text-slate-600 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
          {label}
        </p>
        <p className="text-base font-semibold leading-6 text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition hover:-translate-y-0.5">
        {content}
      </a>
    );
  }

  return content;
}

function MiniCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-600">{desc}</p>
    </div>
  );
}

function OfficeCard({
  office,
  compact = false,
}: {
  office: Office;
  compact?: boolean;
}) {
  const phoneLines = Array.isArray(office.phone)
    ? office.phone
    : office.phone
    ? [office.phone]
    : [];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {office.badge ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 ring-1 ring-slate-100">
          {office.badge}
        </span>
      ) : null}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-sky-50 p-2 text-sky-600 ring-1 ring-sky-100">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
            {office.title}
          </p>
          <p className="text-base font-semibold text-slate-900 leading-6">
            {office.address}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {phoneLines.map((line, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
            <a
              href={`tel:${line.replace(/[^\d+]/g, "")}`}
              className="hover:text-[#05acfb]"
            >
              {line}
            </a>
          </div>
        ))}

        {office.email ? (
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
            <a href={`mailto:${office.email}`} className="hover:text-[#05acfb]">
              {office.email}
            </a>
          </div>
        ) : null}

        {office.mapHref ? (
          <div className="flex items-start gap-2">
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-slate-500" />
            <a
              href={office.mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#05acfb] hover:underline"
            >
              {office.mapLabel}
            </a>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-0 h-16 bg-gradient-to-t from-sky-50/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      ) : null}
    </div>
  );
}
