/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams, usePathname } from "next/navigation";
import type { ProductNode } from "@/features/products/types";

export default function CategoryRail({
  roots,
  activePath,
}: {
  roots: ProductNode[];
  activePath?: string;
}) {
  const t = useTranslations("products");
  const locale = useLocale();
  const normalizedLocale = locale?.toLowerCase().startsWith("en") ? "en" : "vi";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = (path: string | null) => {
    const usp = new URLSearchParams(searchParams?.toString());
    usp.delete("page");
    const query = usp.toString();

    if (!path) {
      router.replace({
        pathname: "/products" as unknown as any,
        query: Object.fromEntries(usp.entries()) as any,
      });
    } else {
      router.replace({
        pathname: "/products/[[...segments]]" as unknown as any,
        params: { segments: path.split("/") } as unknown as any,
        query: Object.fromEntries(usp.entries()) as any,
      });
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Chip active={!activePath} label={t("all")} onClick={() => goTo(null)} />
      {roots.map((r) => (
        <Chip
          key={r._id}
          active={activePath === r.path}
          label={r.title_i18n?.[normalizedLocale] || r.title}
          onClick={() => goTo(r.path)}
        />
      ))}
    </div>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap transition ${
        active ? "shadow" : "hover:bg-gray-50"
      }`}
      style={{
        borderColor: active ? "#05acfb" : "rgba(0,0,0,0.12)",
        backgroundColor: active ? "rgba(5,172,251,0.08)" : "white",
      }}
    >
      {label}
    </button>
  );
}
