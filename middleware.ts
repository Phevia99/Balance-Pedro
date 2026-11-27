import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, configAuth, sesionValida } from "./lib/auth";

// Todo el sitio exige sesión de Google con un correo permitido.
// Públicas solo: la pantalla de login, el inicio/fin del flujo OAuth y los archivos estáticos
// del build (/_next/static: solo código y CSS, sin datos).
const PUBLICAS = ["/login", "/api/auth/login", "/api/auth/callback", "/api/auth/logout"];

const cabeceras = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };

export async function middleware(req: NextRequest) {
  const cfg = configAuth();
  if (!cfg) return new NextResponse("Sitio no configurado.", { status: 503, headers: cabeceras });

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next/static/")) return NextResponse.next();

  const sesion = await sesionValida(req.cookies.get(COOKIE_SESION)?.value, cfg.secret);

  const pasa = () => {
    const res = NextResponse.next();
    for (const [k, v] of Object.entries(cabeceras)) res.headers.set(k, v);
    return res;
  };

  if (PUBLICAS.includes(pathname)) {
    if (sesion && pathname === "/login") return NextResponse.redirect(new URL("/", req.url));
    return pasa();
  }
  if (sesion) return pasa();

  const esPagina = req.method === "GET" && !pathname.startsWith("/api/");
  if (esPagina) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    for (const [k, v] of Object.entries(cabeceras)) res.headers.set(k, v);
    return res;
  }
  return new NextResponse("No autorizado.", { status: 401, headers: cabeceras });
}

export const config = { matcher: "/:path*" };
