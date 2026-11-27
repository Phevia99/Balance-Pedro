import respaldo from "../data/dolar-respaldo.json";
import type { Dolar } from "./calc";

// Se consulta SIEMPRE desde el servidor. Caché de 24 h (revalidate) en el fetch.
const URLS = [
  "https://api.frankfurter.dev/v2/providers/bcch/rate/usd/clp",
  "https://api.frankfurter.dev/v2/rate/USD/CLP",
];

function validar(j: unknown): Dolar | null {
  const o = j as { rate?: unknown; date?: unknown; base?: unknown; quote?: unknown };
  if (
    typeof o?.rate === "number" &&
    o.rate > 100 &&
    o.rate < 5000 &&
    typeof o.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(o.date) &&
    o.base === "USD" &&
    o.quote === "CLP"
  ) {
    return { rate: o.rate, date: o.date, fuente: "api" };
  }
  return null;
}

export function dolarRespaldo(): Dolar {
  const r = Array.isArray(respaldo) ? respaldo[0] : respaldo;
  return { rate: r.rate, date: r.date, fuente: "respaldo" };
}

export async function obtenerDolar(): Promise<Dolar> {
  if (process.env.FORZAR_DOLAR_RESPALDO) return dolarRespaldo();
  for (const url of URLS) {
    try {
      const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const d = validar(await res.json());
      if (d) return d;
    } catch {
      /* probar siguiente / respaldo */
    }
  }
  return dolarRespaldo();
}
