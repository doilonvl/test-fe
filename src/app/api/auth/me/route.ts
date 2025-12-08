/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:5001/api/v1";

export async function GET(req: Request) {
  const api = API_BASE.replace(/\/$/, "");
  const cookie = req.headers.get("cookie") ?? "";
  const authorization = req.headers.get("authorization") ?? "";
  const csrf =
    cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)?.[1] ||
    req.headers.get("x-csrf-token") ||
    "";

  const upstream = await fetch(`${api}/auth/me`, {
    method: "GET",
    headers: {
      cookie,
      ...(authorization ? { Authorization: authorization } : {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    const message = (data as any)?.message ?? "Unauthorized";
    return NextResponse.json({ message }, { status: upstream.status });
  }

  return NextResponse.json(data ?? { ok: true });
}
