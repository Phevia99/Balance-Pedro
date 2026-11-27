import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, opcionesCookie } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.nextUrl.origin), 303);
  res.cookies.set(COOKIE_SESION, "", opcionesCookie(0));
  return res;
}
