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

  if (!token) {
    return NextResponse.json(
      { message: "Missing access token in response" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
