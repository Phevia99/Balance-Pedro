"use client";
import type { Cuenta } from "../lib/calc";
import { clp, pctSimple } from "../lib/format";
import { colorDe } from "../lib/colores";

export default function Tiles({ cuentas }: { cuentas: Cuenta[] }) {
  const ir = (nombre: string) => {
    window.dispatchEvent(new CustomEvent("sector", { detail: nombre }));
    document.getElementById("desglose")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="tiles">
      {cuentas.map((c) => {
        const vacio = c.monto_clp === 0;
        return (
          <button
            key={c.cuenta}
            className={"tile" + (vacio ? " vacio" : "")}
            style={{ ["--tc" as string]: colorDe(c) }}
            onClick={() => !vacio && ir(c.cuenta)}
            aria-label={`${c.cuenta}: ${clp(c.monto_clp)}`}
          >
            <div className="nombre">{c.cuenta}</div>
            <div className="monto" style={c.monto_clp < 0 ? { color: "var(--bad)" } : undefined}>
              {clp(c.monto_clp)}
            </div>
            <div className="sub">
              {c.monto_clp < 0
                ? "Deuda"
                : vacio
                  ? "Sin monto por ahora"
                  : `${pctSimple(c.pctActivos ?? 0)} de tus activos`}
            </div>
          </button>
        );
      })}
    </div>
  );
}
