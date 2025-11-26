import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/request";
import { pathnames } from "@/i18n/navigation";

const intl = createMiddleware({
  locales: [...locales],
  defaultLocale,
  pathnames,
  localePrefix: "as-needed",
  // Force default locale when no explicit selection; avoid Accept-Language choosing English first.
  localeDetection: false,
});

export async function middleware(req: NextRequest) {
  const intlResponse = intl(req);
  const ensureLocaleCookie = (res: NextResponse) => {
    if (!req.cookies.get("NEXT_LOCALE")) {
      res.cookies.set("NEXT_LOCALE", defaultLocale, {
        path: "/",
        sameSite: "lax",
      });
    }
    return res;
  };

  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/(?:(vi|en)\/)?admin(\/|$)/);
  if (match) {
    const locale = (match[1] as "vi" | "en") ?? defaultLocale;
    const makeLoginRedirect = () => {
      const url = req.nextUrl.clone();
      const loginPath =
        locale === defaultLocale ? "/login" : `/${locale}/login`;
      url.pathname = loginPath;
      url.searchParams.set("next", pathname);

      const redirect = NextResponse.redirect(url);
      [
        { name: "access_token", httpOnly: true },
        { name: "access_token_public", httpOnly: false },
        { name: "refresh_token", httpOnly: true },
        { name: "refresh_token_public", httpOnly: false },
      ].forEach(({ name, httpOnly }) =>
        redirect.cookies.set(name, "", {
          path: "/",
          maxAge: 0,
          sameSite: "lax",
          httpOnly,
        })
      );
      return ensureLocaleCookie(redirect);
    };

    // Must have access token cookie
    const hasToken =
      req.cookies.get("access_token")?.value ||
      req.cookies.get("access_token_public")?.value;
    if (!hasToken) return makeLoginRedirect();

    // Validate token/role against backend /auth/me
    const meUrl = new URL("/api/auth/me", req.url);
    const meRes = await fetch(meUrl, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    }).catch(() => null);

    if (!meRes || !meRes.ok) {
      return makeLoginRedirect();
    }
  }

  return ensureLocaleCookie(intlResponse);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
