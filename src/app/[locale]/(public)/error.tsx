/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import NextLink from "next/link";
import { useParams } from "next/navigation";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = String(params?.locale || "vi");
  const homeHref = locale === "vi" ? "/" : `/${locale}`;

  return (
    <main className="min-h-[60vh] grid place-items-center px-6">
      <div className="w-full max-w-xl space-y-6 text-center">
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {locale === "vi" ? "Có lỗi xảy ra" : "Something went wrong"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "vi"
              ? "Vui lòng thử lại hoặc quay về trang chủ."
              : "Please try again or return to the homepage."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl border px-4 py-2 shadow-sm hover:shadow bg-white"
            style={{ borderColor: "#05acfb" }}
          >
            {locale === "vi" ? "Thử lại" : "Retry"}
          </button>
          <NextLink
            href={homeHref}
            className="rounded-xl border px-4 py-2 shadow-sm hover:shadow bg-white"
            style={{ borderColor: "#8fc542" }}
          >
            {locale === "vi" ? "Về trang chủ" : "Go home"}
          </NextLink>
        </div>

        <p className="text-xs text-muted-foreground">
          {locale === "vi"
            ? "Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ quản trị viên."
            : "If the issue persists, please contact the administrator."}
        </p>
      </div>
    </main>
  );
}
