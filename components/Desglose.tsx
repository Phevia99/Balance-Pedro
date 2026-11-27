"use client";
import { useEffect, useState } from "react";
import type { Cuenta } from "../lib/calc";
import { clp, clpConSigno, pct, pctSimple } from "../lib/format";
import { colorDe } from "../lib/colores";

export default function Desglose({ cuentas }: { cuentas: Cuenta[] }) {
  const [sel, setSel] = useState(cuentas.find((c) => c.monto_clp !== 0)?.cuenta ?? cuentas[0].cuenta);
  useEffect(() => {
    const h = (e: Event) => setSel((e as CustomEvent<string>).detail);
    window.addEventListener("sector", h);
    return () => window.removeEventListener("sector", h);
  }, []);

  const maxAbs = Math.max(...cuentas.map((c) => Math.abs(c.monto_clp)), 1);
  const c = cuentas.find((x) => x.cuenta === sel) ?? cuentas[0];
  const maxComp = Math.max(...c.componentes.map((x) => Math.abs(x.monto)), 1);

  return (
    <div className="card" id="desglose">
      <h2>Desglose por sector</h2>
      <div className="sectores">
        {cuentas.map((x) => (
          <button
            key={x.cuenta}
            className="sector"
            aria-pressed={x.cuenta === sel}
            style={{ ["--sc" as string]: colorDe(x) }}
            onClick={() => setSel(x.cuenta)}
          >
            <div className="top">
              <b>{x.cuenta}</b>
              <span>{clp(x.monto_clp)}</span>
            </div>
            <div className="bar16">
              <i style={{ width: `${(Math.abs(x.monto_clp) / maxAbs) * 100}%`, background: colorDe(x) }} />
            </div>
          </button>
        ))}
      </div>

      <div className="detalle">
        <div className="serif" style={{ fontSize: "1.05rem", fontWeight: 700 }}>
          {c.cuenta} · <span style={{ color: c.monto_clp < 0 ? "var(--bad)" : undefined }}>{clp(c.monto_clp)}</span>
        </div>
        <div className="small muted">
          {c.pctActivos != null ? `${pctSimple(c.pctActivos)} de tus activos · ` : ""}
          {c.detalle}
        </div>
        {c.rent && (
          <div className="small" style={{ marginTop: 4 }}>
            Rentabilidad:{" "}
            <span className={c.rent.ganancia >= 0 ? "pos" : "neg"}>
              {clpConSigno(c.rent.ganancia)} ({pct(c.rent.pct)})
            </span>
          </div>
        )}
        {c.componentes.map((x) => (
          <div className="comp" key={x.nombre}>
            <div className="top">
              <span>{x.nombre}</span>
              <b style={{ color: x.monto < 0 ? "var(--bad)" : undefined }}>{clp(x.monto)}</b>
            </div>
            <div className="bar16">
              <i style={{ width: `${(Math.abs(x.monto) / maxComp) * 100}%`, background: colorDe({ ...c, monto_clp: x.monto < 0 ? -1 : 1 }) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
