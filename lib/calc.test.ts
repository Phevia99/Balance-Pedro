import test from "node:test";
import assert from "node:assert/strict";
import { calcular } from "./calc";
import { clp, millones, pct, usd, usdConSigno, fecha } from "./format";
import partidas from "../data/partidas.json";
import parametros from "../data/parametros.json";
import aportes from "../data/aportes.json";
import componentes from "../data/componentes.json";
import historial from "../data/historial.json";

const entrada = (p = parametros[0], rate = 1038.61) => ({
  partidas,
  params: p,
  aportes,
  componentes,
  historial,
  dolar: { rate, date: "2026-11-27", fuente: "respaldo" as const },
  hoy: { y: 2026, m: 11, d: 27 },
});

test("cifras de VERIFICACION.md", () => {
  const r = calcular(entrada());
  assert.equal(r.etoro.monto, 8776255);
  assert.equal(r.patrimonio, 86313431);
  assert.equal(r.liquido, 63813431);
  assert.equal(r.acciones, 22500000);
  assert.equal(r.meses, 44);
  assert.equal(r.ahorro, 1961669);
  assert.equal(r.proyeccion12, 109853458);
  assert.equal(r.deudaTC, -31332237);
  assert.equal(r.kaiken, 30358318);
  assert.equal(r.netoTcKaiken, -973919);
  assert.equal(r.banchile.aportado, 41435832);
  assert.equal(r.banchile.etf, 12714334);
  assert.equal(r.banchile.fm, 28721498);
  assert.equal(r.banchile.ganancia, 11064168);
  assert.equal(pct(r.banchile.pct), "+26,7%");
  assert.equal(usdConSigno(r.etoro.rentUsd), "+US$622");
  assert.equal(pct(r.etoro.rentPct), "+7,9%");
  const get = (n: string) => r.cuentas.find((c) => c.cuenta === n)!.monto_clp;
  assert.equal(get("Banco"), 3442095);
  assert.equal(get("Deudas de personas"), 69000);
  assert.equal(get("Galan (ASX: GLN)"), 0);
});

test("desgloses suman el monto de la cuenta", () => {
  const r = calcular(entrada());
  for (const c of r.cuentas) {
    assert.equal(c.componentes.reduce((s, x) => s + x.monto, 0), c.monto_clp, c.cuenta);
  }
});

test("serie estimada: 44 puntos, el último el 31 oct 2026 = patrimonio", () => {
  const r = calcular(entrada());
  const est = r.serie.filter((s) => s.tipo === "estimado");
  assert.equal(est.length, 44);
  assert.equal(est[0].fecha, "2023-03-31");
  assert.equal(est[43].fecha, "2026-10-31");
  assert.equal(est[43].v, r.patrimonio);
  assert.equal(r.serie.filter((s) => s.tipo === "real").length, 1);
});

test("orden de cubitos: positivas, ceros, negativas", () => {
  const r = calcular(entrada());
  assert.deepEqual(
    r.orden.map((c) => c.cuenta),
    ["Banchile Inversiones", "Deuda de Kaiken", "Acciones IBH", "Etoro", "Banco", "Deudas de personas", "Galan (ASX: GLN)", "Deudas TC"],
  );
});

test("cambiar un monto actualiza todo", () => {
  const p = { ...parametros[0], etoro_actual_usd: 9000 };
  assert.notEqual(calcular(entrada(p)).patrimonio, 86313431);
});

test("formato chileno", () => {
  assert.equal(clp(52500000), "$52.500.000");
  assert.equal(clp(-31332237), "−$31.332.237");
  assert.equal(millones(86313431), "$86,3 M");
  assert.equal(usd(8450), "US$8.450");
  assert.equal(fecha("2026-11-27"), "27 nov 2026");
});
