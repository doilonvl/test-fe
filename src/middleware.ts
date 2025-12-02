/* eslint-disable @typescript-eslint/no-explicit-any */
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/request";
import { pathnames } from "@/i18n/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:5001/api/v1";
const isProd = process.env.NODE_ENV === "production";
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

const intl = createMiddleware({
  locales: [...locales],
  defaultLocale,
  pathnames,
  localePrefix: "as-needed",
  // Force default locale when no explicit selection; avoid Accept-Language choosing English first.
  localeDetection: false,
});

export async function middleware(req: NextRequest) {
  // eslint-disable-next-line prefer-const
  let intlResponse = intl(req);
  const ensureLocaleCookie = (res: NextResponse) => {
    if (!req.cookies.get("NEXT_LOCALE")) {
      res.cookies.set("NEXT_LOCALE", defaultLocale, {
        path: "/",
        sameSite: "lax",
      });
    }
    return res;
  };

  const refreshTokens = async () => {
    const refreshToken =
      req.cookies.get("refresh_token")?.value ||
      req.cookies.get("refresh_token_public")?.value;

    if (!refreshToken) return null;

    const api = API_BASE.replace(/\/$/, "");
    const upstream = await fetch(`${api}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        Cookie: `refresh_token=${refreshToken}; refreshToken=${refreshToken}`,
      },
      cache: "no-store",
    }).catch(() => null);

    if (!upstream || !upstream.ok) return null;
    const data = await upstream.json().catch(() => null);

    const access =
      (data as any)?.access_token ??
      (data as any)?.accessToken ??
      (data as any)?.token;
    const refresh =
      (data as any)?.refresh_token ??
      (data as any)?.refreshToken ??
      (data as any)?.refresh ??
      refreshToken;

    if (!access) return null;
    return { access, refresh };
  };

  const setAuthCookies = (
    res: NextResponse,
    tokens: { access: string; refresh: string }
  ) => {
    res.cookies.set("access_token", tokens.access, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
    res.cookies.set("access_token_public", tokens.access, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
    res.cookies.set("refresh_token", tokens.refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
    res.cookies.set("refresh_token_public", tokens.refresh, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
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
      const refreshed = await refreshTokens();
      if (refreshed) {
        setAuthCookies(intlResponse, refreshed);

        const retryMe = await fetch(meUrl, {
          method: "GET",
          headers: {
            cookie: [
              req.headers.get("cookie") ?? "",
              `access_token=${refreshed.access}`,
              `access_token_public=${refreshed.access}`,
              `refresh_token=${refreshed.refresh}`,
              `refresh_token_public=${refreshed.refresh}`,
            ]
              .filter(Boolean)
              .join("; "),
            Authorization: `Bearer ${refreshed.access}`,
          },
          cache: "no-store",
        }).catch(() => null);

        if (retryMe?.ok) {
          return ensureLocaleCookie(intlResponse);
        }
      }
      return makeLoginRedirect();
    }
  }

  return ensureLocaleCookie(intlResponse);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
