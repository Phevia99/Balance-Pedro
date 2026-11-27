import { tasaDolar, usd } from "./format";

export type Partida = { cuenta: string; tipo: string; monto_clp: number; detalle: string };
export type Params = {
  inicio: string;
  bonos_pagados: number;
  bono_quarter_clp: number;
  proximo_bono: string;
  etoro_inicio_usd: number;
  etoro_actual_usd: number;
  etoro_desde: string;
};
export type Aporte = { instrumento: string; tipo: string; aporte_clp: number };
export type Componente = { cuenta: string; componente: string; monto_clp: number };
export type Registro = { fecha: string; patrimonio_clp: number; nota: string };
export type Dolar = { rate: number; date: string; fuente: "api" | "respaldo" };
export type Hoy = { y: number; m: number; d: number };

export type Cuenta = Partida & {
  color: number;
  pctActivos: number | null;
  componentes: { nombre: string; monto: number }[];
  rent?: { ganancia: number; pct: number };
};
export type PuntoHistoria = { fecha: string; v: number; tipo: "estimado" | "real" };

const r0 = (x: number) => Math.round(+x.toFixed(4));

export function mesesCompletos(hoy: Hoy, inicio: string): number {
  const [iy, im] = inicio.split("-").map(Number);
  return (hoy.y - iy) * 12 + hoy.m - im;
}

export function calcular(i: {
  partidas: Partida[];
  params: Params;
  aportes: Aporte[];
  componentes: Componente[];
  historial: Registro[];
  dolar: Dolar;
  hoy: Hoy;
}) {
  const { partidas, params: p, aportes, componentes, historial, dolar, hoy } = i;

  // Etoro se calcula en dólares
  const etoroMonto = r0(p.etoro_actual_usd * dolar.rate);
  const etoro: Partida = {
    cuenta: "Etoro",
    tipo: "inversion",
    monto_clp: etoroMonto,
    detalle: `Acciones en EE.UU.: ${usd(p.etoro_actual_usd)} al dólar de ${tasaDolar(dolar.rate)}`,
  };
  const base = [partidas[0], etoro, ...partidas.slice(1)];

  const patrimonio = base.reduce((s, c) => s + c.monto_clp, 0);
  const activos = base.filter((c) => c.monto_clp > 0).reduce((s, c) => s + c.monto_clp, 0);
  const acciones = base.filter((c) => c.tipo === "acciones_empresa").reduce((s, c) => s + c.monto_clp, 0);
  const liquido = patrimonio - acciones;
  const meses = mesesCompletos(hoy, p.inicio);
  const ahorro = meses > 0 ? patrimonio / meses : 0;
  const kaiken = base.find((c) => c.cuenta === "Deuda de Kaiken")?.monto_clp ?? 0;
  const deudaTC = base.filter((c) => c.tipo === "deuda").reduce((s, c) => s + c.monto_clp, 0);

  // Etoro
  const etoroRentUsd = p.etoro_actual_usd - p.etoro_inicio_usd;
  const etoroRentPct = etoroRentUsd / p.etoro_inicio_usd;

  // Banchile
  const aportado = aportes.reduce((s, a) => s + a.aporte_clp, 0);
  const valorBanchile = base.find((c) => c.cuenta === "Banchile Inversiones")?.monto_clp ?? 0;
  const gananciaBanchile = valorBanchile - aportado;
  const banchile = {
    aportado,
    valor: valorBanchile,
    ganancia: gananciaBanchile,
    pct: aportado ? gananciaBanchile / aportado : 0,
    etf: aportes.filter((a) => a.tipo === "ETF").reduce((s, a) => s + a.aporte_clp, 0),
    fm: aportes.filter((a) => a.tipo === "Fondos mutuos").reduce((s, a) => s + a.aporte_clp, 0),
  };

  // Desglose por sector
  const desglose = (c: Partida): { nombre: string; monto: number }[] => {
    let comps: { nombre: string; monto: number }[];
    if (c.cuenta === "Banchile Inversiones") {
      comps = [
        ...aportes.map((a) => ({ nombre: a.instrumento, monto: a.aporte_clp })),
        { nombre: "Ganancia acumulada", monto: gananciaBanchile },
      ];
    } else if (c.cuenta === "Etoro") {
      const ap = r0(p.etoro_inicio_usd * dolar.rate);
      comps = [
        { nombre: "Aportado (inicio)", monto: ap },
        { nombre: "Ganancia acumulada", monto: c.monto_clp - ap },
      ];
    } else {
      comps = componentes
        .filter((x) => x.cuenta === c.cuenta)
        .map((x) => ({ nombre: x.componente, monto: x.monto_clp }));
    }
    const dif = c.monto_clp - comps.reduce((s, x) => s + x.monto, 0);
    if (dif !== 0) comps.push({ nombre: "Sin desglosar", monto: dif });
    return comps;
  };

  const cuentas: Cuenta[] = base.map((c, idx) => ({
    ...c,
    color: idx,
    pctActivos: c.monto_clp > 0 && activos ? c.monto_clp / activos : null,
    componentes: desglose(c),
    rent:
      c.cuenta === "Banchile Inversiones"
        ? { ganancia: banchile.ganancia, pct: banchile.pct }
        : c.cuenta === "Etoro"
          ? { ganancia: r0(etoroRentUsd * dolar.rate), pct: etoroRentPct }
          : undefined,
  }));

  // Orden de cubitos: positivas desc, ceros, negativas
  const orden = [
    ...cuentas.filter((c) => c.monto_clp > 0).sort((a, b) => b.monto_clp - a.monto_clp),
    ...cuentas.filter((c) => c.monto_clp === 0),
    ...cuentas.filter((c) => c.monto_clp < 0).sort((a, b) => a.monto_clp - b.monto_clp),
  ];

  // Proyección 12 meses
  const proyeccion = Array.from({ length: 13 }, (_, m) => ({ m, v: r0(patrimonio + ahorro * m) }));

  // Serie de historia
  const [iy, im] = p.inicio.split("-").map(Number);
  const serie: PuntoHistoria[] = [
    ...Array.from({ length: Math.max(meses, 0) }, (_, k) => ({
      fecha: new Date(Date.UTC(iy, im - 1 + k + 1, 0)).toISOString().slice(0, 10),
      v: r0(ahorro * (k + 1)),
      tipo: "estimado" as const,
    })),
    ...historial.map((h) => ({ fecha: h.fecha, v: h.patrimonio_clp, tipo: "real" as const })),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return {
    cuentas,
    orden,
    patrimonio,
    activos,
    acciones,
    liquido,
    meses,
    ahorro: r0(ahorro),
    proyeccion12: proyeccion[12].v,
    proyeccion,
    kaiken,
    deudaTC,
    netoTcKaiken: kaiken + deudaTC,
    etoro: {
      monto: etoroMonto,
      inicioUsd: p.etoro_inicio_usd,
      actualUsd: p.etoro_actual_usd,
      rentUsd: etoroRentUsd,
      rentPct: etoroRentPct,
    },
    banchile,
    serie,
    dolar,
  };
}

export type Resultado = ReturnType<typeof calcular>;
