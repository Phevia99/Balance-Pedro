import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_OAUTH,
  COOKIE_SESION,
  DURACION_SESION_S,
  configAuth,
  esPermitido,
  opcionesCookie,
} from "../../../../lib/auth";
import { firmar, unb64u, verificar } from "../../../../lib/session";

export const dynamic = "force-dynamic";

function volver(req: NextRequest, error?: string) {
  const url = new URL("/login", req.nextUrl.origin);
  if (error) url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_OAUTH, "", opcionesCookie(0));
  return res;
}

export async function GET(req: NextRequest) {
  const cfg = configAuth();
  if (!cfg) return new NextResponse("Sitio no configurado.", { status: 503 });

  const p = req.nextUrl.searchParams;
  if (p.get("error") || !p.get("code")) return volver(req, "cancelado");

  // 1) El state y el verifier PKCE deben coincidir con los que guardamos al iniciar.
  const guardado = await verificar<{ state: string; verifier: string; exp: number }>(
    req.cookies.get(COOKIE_OAUTH)?.value ?? "",
    cfg.secret,
  );
  if (!guardado || guardado.exp < Date.now() / 1000 || guardado.state !== p.get("state")) {
    return volver(req, "expirado");
  }

  // 2) Canje del código en el servidor de Google (conexión directa HTTPS con el secreto del cliente).
  let idToken: string | undefined;
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: p.get("code")!,
        client_id: cfg.id,
        client_secret: cfg.clientSecret,
        redirect_uri: `${req.nextUrl.origin}/api/auth/callback`,
        grant_type: "authorization_code",
        code_verifier: guardado.verifier,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return volver(req, "fallo");
    idToken = (await r.json()).id_token;
  } catch {
    return volver(req, "fallo");
  }

  // 3) Datos del id_token (recibido directo de Google por TLS) y comprobaciones.
  let claims: { iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean };
  try {
    claims = JSON.parse(new TextDecoder().decode(unb64u(idToken!.split(".")[1])));
  } catch {
    return volver(req, "fallo");
  }
  const ok =
    (claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com") &&
    claims.aud === cfg.id &&
    typeof claims.exp === "number" &&
    claims.exp > Date.now() / 1000 &&
    claims.email_verified === true &&
    esPermitido(claims.email);
  if (!ok) return volver(req, "denegado");

  // 4) Sesión propia firmada.
  const exp = Math.floor(Date.now() / 1000) + DURACION_SESION_S;
  const res = NextResponse.redirect(new URL("/", req.nextUrl.origin));
  res.cookies.set(COOKIE_SESION, await firmar({ email: claims.email!.toLowerCase(), exp }, cfg.secret), opcionesCookie(DURACION_SESION_S));
  res.cookies.set(COOKIE_OAUTH, "", opcionesCookie(0));
  return res;
}
