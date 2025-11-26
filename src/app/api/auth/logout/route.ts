/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:5001/api/v1";

export async function POST(req: Request) {
  const api = API_BASE.replace(/\/$/, "");
  const cookieHeader = req.headers.get("cookie") ?? "";

  // Best-effort notify backend to invalidate session
  try {
    await fetch(`${api}/auth/logout`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      credentials: "include",
    });
  } catch {
    // ignore backend logout errors; still clear local cookies
  }

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  const clear = (
    name: string,
    options: { httpOnly?: boolean } = { httpOnly: false }
  ) => {
    res.cookies.set(name, "", {
      httpOnly: options.httpOnly,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  };

  clear("access_token", { httpOnly: true });
  clear("access_token_public");
  clear("refresh_token", { httpOnly: true });
  clear("refresh_token_public");

  return res;
}
