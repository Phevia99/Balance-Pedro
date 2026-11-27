// Cookies de sesión firmadas con HMAC-SHA256 (WebCrypto: funciona en el middleware y en las rutas).
const enc = new TextEncoder();

export function b64u(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function unb64u(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const clave = (secret: string) =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export async function firmar(payload: object, secret: string): Promise<string> {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await clave(secret), enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

export async function verificar<T>(token: string, secret: string): Promise<T | null> {
  const partes = token.split(".");
  if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await clave(secret),
      unb64u(partes[1]) as BufferSource,
      enc.encode(partes[0]),
    );
    if (!ok) return null;
    return JSON.parse(new TextDecoder().decode(unb64u(partes[0]))) as T;
  } catch {
    return null;
  }
}

export function aleatorio(bytes = 32): string {
  return b64u(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256b64u(texto: string): Promise<string> {
  return b64u(await crypto.subtle.digest("SHA-256", enc.encode(texto)));
}
