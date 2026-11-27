import { NextRequest, NextResponse } from "next/server";
import { COOKIE_OAUTH, configAuth, opcionesCookie } from "../../../../lib/auth";
import { aleatorio, firmar, sha256b64u } from "../../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cfg = configAuth();
  if (!cfg) return new NextResponse("Sitio no configurado.", { status: 503 });

  const state = aleatorio(16);
  const verifier = aleatorio(32); // PKCE
  const redirectUri = `${req.nextUrl.origin}/api/auth/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: cfg.id,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email",
    state,
    code_challenge: await sha256b64u(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(url);
  const token = await firmar({ state, verifier, exp: Math.floor(Date.now() / 1000) + 600 }, cfg.secret);
  res.cookies.set(COOKIE_OAUTH, token, opcionesCookie(600));
  return res;
}
