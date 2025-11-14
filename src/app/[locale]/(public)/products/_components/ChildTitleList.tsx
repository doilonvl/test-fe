"use client";

import { Link } from "@/i18n/navigation";
import type { ProductNode } from "@/features/products/types";
import { useLocale } from "next-intl";

export default function ChildTitleList({
  children,
}: {
  children: ProductNode[];
}) {
  const locale = useLocale();
  const normalizedLocale = locale?.toLowerCase().startsWith("en") ? "en" : "vi";

  if (!children?.length) return null;

  return (
    <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {children.map((c) => {
        const href =
          c.type === "item"
            ? ({
                pathname: "/products/[slug]",
                params: { slug: c.slug },
              } as const)
            : ({
                pathname: "/products/[[...segments]]",
                params: { segments: c.path.split("/") },
              } as const);
        const localizedTitle = c.title_i18n?.[normalizedLocale] || c.title;

        return (
          <li key={c._id} className="min-w-0">
            <Link
              href={href}
              className="inline-flex w-full items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
            >
              <span className="truncate">{localizedTitle}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
