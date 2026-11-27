import test from "node:test";
import assert from "node:assert/strict";
import { esPermitido, sesionValida } from "./auth";
import { firmar, verificar } from "./session";

const S = "x".repeat(40);
const ahora = () => Math.floor(Date.now() / 1000);

test("solo los 3 correos permitidos (sin importar mayúsculas)", () => {
  assert.ok(esPermitido("phevia@kaiken.info"));
  assert.ok(esPermitido("Phevia99@Gmail.com"));
  assert.ok(esPermitido("aqhelzo@gmail.com"));
  assert.ok(!esPermitido("otro@gmail.com"));
  assert.ok(!esPermitido("phevia99@gmail.com.evil.com"));
  assert.ok(!esPermitido("xphevia@kaiken.info"));
  assert.ok(!esPermitido(""));
  assert.ok(!esPermitido(undefined));
});

test("firma: válida, manipulada y con otra clave", async () => {
  const t = await firmar({ email: "phevia99@gmail.com", exp: ahora() + 60 }, S);
  assert.ok(await verificar(t, S));
  assert.equal(await verificar(t, "y".repeat(40)), null);
  const [b, sig] = t.split(".");
  const falso = Buffer.from(JSON.stringify({ email: "otro@gmail.com", exp: ahora() + 60 })).toString("base64url");
  assert.equal(await verificar(`${falso}.${sig}`, S), null);
  assert.equal(await verificar(`${b}.`, S), null);
  assert.equal(await verificar("basura", S), null);
});

test("sesión: expirada o de correo no permitido se rechaza", async () => {
  const ok = await firmar({ email: "aqhelzo@gmail.com", exp: ahora() + 60 }, S);
  const vencida = await firmar({ email: "aqhelzo@gmail.com", exp: ahora() - 1 }, S);
  const intruso = await firmar({ email: "otro@gmail.com", exp: ahora() + 60 }, S);
  assert.ok(await sesionValida(ok, S));
  assert.equal(await sesionValida(vencida, S), null);
  assert.equal(await sesionValida(intruso, S), null);
  assert.equal(await sesionValida(undefined, S), null);
});
