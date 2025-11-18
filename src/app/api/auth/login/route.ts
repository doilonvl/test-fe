/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:5001/api/v1";

export async function POST(req: Request) {
  const body = await req.json();
  const api = API_BASE.replace(/\/$/, "");

  const upstream = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => null);
    const message = (data as any)?.message ?? "Login failed";
    return NextResponse.json({ message }, { status: upstream.status });
  }

  const data = await upstream.json().catch(() => null);
  const token =
    (data as any)?.access_token ??
    (data as any)?.accessToken ??
    (data as any)?.token;
  const refresh =
    (data as any)?.refresh_token ??
    (data as any)?.refreshToken ??
    (data as any)?.refresh;

  const isProd = process.env.NODE_ENV === "production";

  if (!token) {
    return NextResponse.json(
      { message: "Missing access token in response" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes (align access token)
  });
  res.cookies.set("access_token_public", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
  if (refresh) {
    res.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    res.cookies.set("refresh_token_public", refresh, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}
