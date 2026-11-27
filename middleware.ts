import { NextRequest, NextResponse } from "next/server";

// Basic Auth sobre TODAS las rutas (páginas, API y archivos estáticos).
// Si SITE_PASSWORD no está definida, el sitio se cierra (nunca queda público por error).

function igual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function middleware(req: NextRequest) {
  const headers = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
  const clave = process.env.SITE_PASSWORD;
  const usuario = process.env.SITE_USER || "pedro";

  if (!clave) {
    return new NextResponse("Sitio no configurado.", { status: 503, headers });
  }

  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Basic ")) {
    try {
      const [u, ...resto] = atob(auth.slice(6)).split(":");
      if (igual(u, usuario) && igual(resto.join(":"), clave)) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "private, no-store");
        return res;
      }
    } catch {
      /* credenciales mal formadas */
    }
  }
  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { ...headers, "WWW-Authenticate": 'Basic realm="Balance Pedro", charset="UTF-8"' },
  });
}

export const config = { matcher: "/:path*" };
