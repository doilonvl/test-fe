/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:5001/api/v1";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const authHeader = req.headers.get("authorization") || "";
  const headerRefresh = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";
  const refreshToken =
    headerRefresh ||
    (await cookieStore).get("refresh_token")?.value ||
    (await cookieStore).get("refresh_token_public")?.value;
  const csrfToken =
    req.headers.get("x-csrf-token") ||
    (await cookieStore).get("csrf_token")?.value ||
    "";

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Missing refresh token" },
      { status: 401 }
    );
  }

  const api = API_BASE.replace(/\/$/, "");

  // Try to refresh by forwarding token both as Authorization and as cookie
  const upstream = await fetch(`${api}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      // Some backends expect refresh token in cookies (include csrf to satisfy double-submit)
      Cookie: `refresh_token=${refreshToken}; refreshToken=${refreshToken}${
        csrfToken ? `; csrf_token=${csrfToken}` : ""
      }`,
    },
    credentials: "include",
  });

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => null);
    const message = (data as any)?.message ?? "Refresh failed";
    return NextResponse.json({ message }, { status: upstream.status });
  }

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

  if (!access) {
    return NextResponse.json(
      { message: "Missing access token in refresh response" },
      { status: 500 }
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  res.cookies.set("access_token", access, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });
  res.cookies.set("access_token_public", access, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 15,
  });
  res.cookies.set("refresh_token", refresh, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  res.cookies.set("refresh_token_public", refresh, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // Rotate CSRF token alongside refresh
  const newCsrfToken = randomUUID();
  res.cookies.set("csrf_token", newCsrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
