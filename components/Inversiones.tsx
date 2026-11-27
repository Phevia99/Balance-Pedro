import type { Resultado } from "../lib/calc";
import { clp, clpConSigno, fecha, pct, tasaDolar, usd, usdConSigno } from "../lib/format";

function Barra({ w, color, texto }: { w: number; color: string; texto: string }) {
  return (
    <div className="bar26" style={{ width: `${Math.max(w, 0) * 100}%`, background: color }}>
      <span>{texto}</span>
    </div>
  );
}

export default function Inversiones({ r }: { r: Resultado }) {
  const b = r.banchile;
  const e = r.etoro;
  const mb = Math.max(b.aportado, b.valor);
  const me = Math.max(e.inicioUsd, e.actualUsd);
  return (
    <div className="card">
      <h2>Tus inversiones: aportado frente a hoy</h2>

      <div className="sub-inv">
        <b>Banchile Inversiones</b>
        <div className="barras">
          <div>
            <div className="lbl muted">Aportado</div>
            <Barra w={b.aportado / mb} color="var(--c0)" texto={clp(b.aportado)} />
          </div>
          <div>
            <div className="lbl muted">Valor hoy</div>
            <Barra w={b.valor / mb} color="var(--c1)" texto={clp(b.valor)} />
          </div>
        </div>
        <p className="small" style={{ marginBottom: 0 }}>
          Rentabilidad:{" "}
          <span className={b.ganancia >= 0 ? "pos" : "neg"}>
            {clpConSigno(b.ganancia)} ({pct(b.pct)})
          </span>
          <span className="muted"> · ETF {clp(b.etf)} + fondos mutuos {clp(b.fm)}</span>
        </p>
      </div>

      <div className="sub-inv">
        <b>Etoro</b> <span className="muted small">(acciones en EE.UU., en dólares)</span>
        <div className="barras">
          <div>
            <div className="lbl muted">Inicio</div>
            <Barra w={e.inicioUsd / me} color="var(--c2)" texto={usd(e.inicioUsd)} />
          </div>
          <div>
            <div className="lbl muted">Hoy</div>
            <Barra w={e.actualUsd / me} color="var(--c3)" texto={usd(e.actualUsd)} />
          </div>
        </div>
        <p className="small" style={{ marginBottom: 0 }}>
          Rentabilidad:{" "}
          <span className={e.rentUsd >= 0 ? "pos" : "neg"}>
            {usdConSigno(e.rentUsd)} ({pct(e.rentPct)})
          </span>
          <span className="muted">
            {" "}· Dólar usado: {tasaDolar(r.dolar.rate)} ({fecha(r.dolar.date)})
          </span>
        </p>
        <p className="note">Tipo de cambio de referencia, no el precio exacto de Etoro.</p>
      </div>
    </div>
  );
}
