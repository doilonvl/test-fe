import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata, mergeKeywords } from "@/lib/seo";

type PrivacyBlock = { subtitle: string; items: string[] };
type PrivacySection = {
  title: string;
  items?: string[];
  blocks?: PrivacyBlock[];
};
type PrivacyContact = {
  title: string;
  description: string;
  emailLabel: string;
  phoneLabel: string;
  addressLabel: string;
  email: string;
  phone: string;
  address: string;
};

const hasBlocks = (
  section: PrivacySection
): section is PrivacySection & { blocks: PrivacyBlock[] } =>
  Array.isArray(section.blocks);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  const seo = await getTranslations("seo");
  const locale = await getLocale();
  const industryKeywords = seo.raw("keywords.industry") as string[];
  return buildPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: mergeKeywords(industryKeywords),
    href: "/privacy",
    locale,
  });
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("privacy");
  const locale = await getLocale();
  const sections = (t.raw("sections") as PrivacySection[]) ?? [];
  const contact = t.raw("contact") as PrivacyContact;

  const lastUpdated = new Date().toLocaleDateString(
    locale === "vi" ? "vi-VN" : "en-US"
  );

  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-white">
      <section className="mx-auto max-w-5xl px-4 py-12 lg:py-16">
        <div className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto max-w-3xl text-base text-slate-600">
            {t("intro")}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-100">
          <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50 px-6 py-4">
            <p className="text-sm font-medium text-slate-700">
              {t("lastUpdated")}: {lastUpdated}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {sections.map((section) => (
              <div key={section.title} className="px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="text-lg font-semibold text-slate-800">
                  {section.title}
                </h2>
                {hasBlocks(section) ? (
                  <div className="mt-4 space-y-5">
                    {section.blocks.map((block) => (
                      <div key={block.subtitle} className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">
                          {block.subtitle}
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                          {block.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    {section.items?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <h2 className="text-lg font-semibold text-slate-800">
                {contact.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                {contact.description}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">
                    {contact.emailLabel}
                  </p>
                  <p>{contact.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">
                    {contact.phoneLabel}
                  </p>
                  <p>{contact.phone}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="font-medium text-slate-800">
                    {contact.addressLabel}
                  </p>
                  <p>{contact.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
