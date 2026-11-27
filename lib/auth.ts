import { verificar } from "./session";

// Únicos correos que pueden entrar. Se vuelven a comprobar en CADA request:
// quitar uno de esta lista revoca su sesión de inmediato.
export const CORREOS_PERMITIDOS = ["phevia@kaiken.info", "phevia99@gmail.com", "aqhelzo@gmail.com"];

export const COOKIE_SESION = "bp_session";
export const COOKIE_OAUTH = "bp_oauth";
export const DURACION_SESION_S = 60 * 60 * 24 * 30; // 30 días

export type Sesion = { email: string; exp: number };

export const esPermitido = (email?: string | null): boolean =>
  !!email && CORREOS_PERMITIDOS.includes(email.trim().toLowerCase());

// Si falta algo, el sitio se cierra (nunca queda abierto por error).
export function configAuth() {
  const secret = process.env.AUTH_SECRET;
  const id = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!secret || secret.length < 32 || !id || !clientSecret) return null;
  return { secret, id, clientSecret };
}

export async function sesionValida(token: string | undefined, secret: string): Promise<Sesion | null> {
  if (!token) return null;
  const s = await verificar<Sesion>(token, secret);
  if (!s || typeof s.exp !== "number" || s.exp <= Date.now() / 1000) return null;
  return esPermitido(s.email) ? s : null;
}

export const opcionesCookie = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});
