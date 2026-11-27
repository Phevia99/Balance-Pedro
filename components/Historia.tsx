"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PuntoHistoria } from "../lib/calc";
import { clp, clpConSigno, fecha, mesCorto, millones, pct } from "../lib/format";

const PL = 8, PR = 46, PT = 12, PB = 24;
type Rango = "todo" | "1a" | "6m";
const t = (f: string) => Date.parse(f + "T00:00:00Z");

export default function Historia({ serie }: { serie: PuntoHistoria[] }) {
  const [rango, setRango] = useState<Rango>("todo");
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  // El gráfico se dibuja al tamaño real de su caja (1:1) para que el texto y las líneas se vean nítidos.
  const [W, setW] = useState(340);
  const H = Math.round(Math.min(Math.max(W * 0.55, 190), 250));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setW(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { pts, est, real, x, y, ticksY, ticksX } = useMemo(() => {
    const fin = t(serie[serie.length - 1].fecha);
    const meses = rango === "1a" ? 12 : rango === "6m" ? 6 : 0;
    const corte = meses ? fin - meses * 30.44 * 864e5 : -Infinity;
    const pts = serie.filter((p) => t(p.fecha) >= corte);
    const t0 = t(pts[0].fecha), t1 = t(pts[pts.length - 1].fecha) || t0 + 1;
    const vs = pts.map((p) => p.v);
    const mx = Math.max(...vs), mn = Math.min(...vs);
    const span = mx - mn || mx || 1;
    const lo = rango === "todo" ? 0 : Math.max(0, mn - span * 0.1);
    const hi = mx + span * 0.08;
    const x = (f: string) => PL + ((t(f) - t0) / (t1 - t0 || 1)) * (W - PL - PR);
    const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
    const ticksY = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3);
    const ticksX = [pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]];
    return { pts, est: pts.filter((p) => p.tipo === "estimado"), real: pts.filter((p) => p.tipo === "real"), x, y, ticksY, ticksX };
  }, [serie, rango, W, H]);

  const path = (a: PuntoHistoria[]) => a.map((p, i) => `${i ? "L" : "M"}${x(p.fecha).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const base = H - PB;
  const area = est.length ? `${path(est)} L${x(est[est.length - 1].fecha)},${base} L${x(est[0].fecha)},${base} Z` : "";

  const primera = est[0] ?? pts[0];
  const ultima = pts[pts.length - 1];
  const delta = ultima.v - primera.v;

  const mover = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0, d = Infinity;
    pts.forEach((p, i) => {
      const dd = Math.abs(x(p.fecha) - px);
      if (dd < d) { d = dd; best = i; }
    });
    setHover(best);
  };
  const hp = hover != null && hover < pts.length ? pts[hover] : null;

  return (
    <div className="card">
      <h2>Cómo ha ido subiendo tu patrimonio</h2>
      <div className="hist-head">
        <div className="v">{clp(ultima.v)}</div>
        <div className="small muted">
          Variación del período (estimada):{" "}
          <span className={delta >= 0 ? "pos" : "neg"}>
            {clpConSigno(delta)}{primera.v > 0 && Math.abs(delta / primera.v) <= 10 ? ` (${pct(delta / primera.v)})` : ""}
          </span>
        </div>
      </div>
      <div className="rango">
        {([["todo", "Todo"], ["1a", "1 año"], ["6m", "6 meses"]] as const).map(([k, l]) => (
          <button key={k} aria-pressed={rango === k} onClick={() => { setRango(k); setHover(null); }}>{l}</button>
        ))}
      </div>
      <div className="chart-box" ref={ref} onPointerMove={mover} onPointerDown={mover} onPointerLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ height: H }} role="img" aria-label="Evolución del patrimonio">
          {ticksY.map((v, i) => (
            <g key={i}>
              <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" />
              <text x={W - PR + 4} y={y(v) + 3} fontSize="10" fill="var(--muted)">{`$${Math.round(v / 1e6)} M`}</text>
            </g>
          ))}
          {ticksX.map((p, i) => (
            <text key={i} x={x(p.fecha)} y={H - 6} fontSize="10" fill="var(--muted)" textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}>
              {mesCorto(p.fecha)}
            </text>
          ))}
          {area && <path d={area} fill="var(--c0)" opacity="0.12" />}
          {est.length > 1 && <path d={path(est)} fill="none" stroke="var(--c0)" strokeWidth="2" strokeDasharray="4 4" />}
          {real.length > 1 && <path d={path(real)} fill="none" stroke="var(--c1)" strokeWidth="2.5" />}
          {real.map((p) => (
            <circle key={p.fecha} cx={x(p.fecha)} cy={y(p.v)} r="5" fill="var(--c1)" stroke="var(--card)" strokeWidth="2" />
          ))}
          {hp && (
            <g>
              <line x1={x(hp.fecha)} x2={x(hp.fecha)} y1={PT} y2={base} stroke="var(--muted)" strokeWidth="1" />
              <circle cx={x(hp.fecha)} cy={y(hp.v)} r="4" fill={hp.tipo === "real" ? "var(--c1)" : "var(--c0)"} />
            </g>
          )}
        </svg>
        {hp && (
          <div className="tip" style={{ left: `clamp(0px, calc(${(x(hp.fecha) / W) * 100}% - 60px), calc(100% - 150px))` }}>
            <b>{millones(hp.v)}</b> · {fecha(hp.fecha)}
            <br />
            {hp.tipo === "estimado" ? "estimado" : "registro real"}
          </div>
        )}
      </div>
      <p className="note">
        La línea punteada es una <b>estimación</b> que supone el mismo ahorro cada mes; los puntos sólidos son registros reales.
      </p>
    </div>
  );
}
