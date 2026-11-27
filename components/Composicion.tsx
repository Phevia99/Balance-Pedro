import type { Resultado } from "../lib/calc";
import { clp, pctSimple } from "../lib/format";
import { colorDe } from "../lib/colores";

export default function Composicion({ r }: { r: Resultado }) {
  const pos = r.cuentas.filter((c) => c.monto_clp > 0).sort((a, b) => b.monto_clp - a.monto_clp);
  return (
    <div className="card">
      <h2>De qué está hecho lo que tienes</h2>
      <div className="stack" role="img" aria-label="Composición de tus activos">
        {pos.map((c) => (
          <div key={c.cuenta} style={{ flex: c.monto_clp, background: colorDe(c) }} title={`${c.cuenta}: ${clp(c.monto_clp)}`} />
        ))}
      </div>
      <div className="leyenda">
        {pos.map((c) => (
          <div className="fila" key={c.cuenta}>
            <span className="dot" style={{ background: colorDe(c) }} />
            <span className="n">{c.cuenta}</span>
            <b>{clp(c.monto_clp)}</b>
            <span className="muted" style={{ width: 40, textAlign: "right" }}>{pctSimple(c.pctActivos ?? 0)}</span>
          </div>
        ))}
      </div>
      <p className="note" style={{ fontSize: "0.86rem" }}>
        Tarjetas de crédito: <b className="neg">{clp(r.deudaTC)}</b> · Deuda de Kaiken: <b>{clp(r.kaiken)}</b> · Neto Kaiken − tarjetas:{" "}
        <b className={r.netoTcKaiken < 0 ? "neg" : "pos"}>{clp(r.netoTcKaiken)}</b> · Líquido: <b>{clp(r.liquido)}</b> · Acciones IBH:{" "}
        <b>{clp(r.acciones)}</b>
      </p>
    </div>
  );
}
