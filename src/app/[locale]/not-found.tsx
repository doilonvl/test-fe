import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="min-h-[70vh] grid place-items-center px-6">
      <div className="w-full max-w-xl text-center space-y-6">
        <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border shadow-sm hover:shadow bg-white"
            style={{ borderColor: "#05acfb" }}
          >
            {t("ctaHome")}
          </Link>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
          style={{ backgroundColor: "rgba(143,197,66,0.12)", color: "#3e6d09" }}
        >
          <span>404</span>
          <span>-&gt;</span>
          <span>{t("hint")}</span>
        </div>
      </div>
    </main>
  );
}
