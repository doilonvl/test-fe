import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/request";
import SiteHeader from "@/components/shared/site-header";
import SiteFooter from "@/components/shared/site-footer";
import { Toaster } from "@/components/ui/sonner";

export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  setRequestLocale(resolvedLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      <SiteHeader />
      {children}
      <SiteFooter />
      <Toaster />
    </NextIntlClientProvider>
  );
}
