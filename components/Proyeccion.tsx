import { clp, millones } from "../lib/format";

const W = 360, H = 190, PL = 14, PR = 14, PT = 30, PB = 14;

export default function Proyeccion({ puntos }: { puntos: { m: number; v: number }[] }) {
  const lo = Math.min(...puntos.map((p) => p.v)) * 0.95;
  const hi = Math.max(...puntos.map((p) => p.v));
  const x = (m: number) => PL + (m / 12) * (W - PL - PR);
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo || 1)) * (H - PT - PB);
  const d = puntos.map((p, i) => `${i ? "L" : "M"}${x(p.m).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const marcas = [
    { m: 0, l: "Hoy", a: "start" },
    { m: 6, l: "6 m", a: "middle" },
    { m: 12, l: "12 m", a: "end" },
  ] as const;
  return (
    <div className="card">
      <h2>Hacia dónde va tu patrimonio en 12 meses</h2>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Proyección a 12 meses">
        <path d={`${d} L${x(12)},${H - PB} L${x(0)},${H - PB} Z`} fill="var(--c1)" opacity="0.12" />
        <path d={d} fill="none" stroke="var(--c1)" strokeWidth="3" strokeLinecap="round" />
        {puntos.map((p) => (
          <circle key={p.m} cx={x(p.m)} cy={y(p.v)} r="3" fill="var(--c1)">
            <title>{`${p.m === 0 ? "Hoy" : `En ${p.m} meses`}: ${clp(p.v)}`}</title>
          </circle>
        ))}
        {marcas.map(({ m, l, a }) => {
          const p = puntos[m];
          return (
            <g key={m}>
              <circle cx={x(m)} cy={y(p.v)} r="6" fill="var(--c1)" stroke="var(--card)" strokeWidth="2" />
              <text x={x(m)} y={y(p.v) - 12} fontSize="12" fontWeight="700" fill="var(--text)" textAnchor={a}>{millones(p.v)}</text>
              <text x={x(m)} y={H - 1} fontSize="10" fill="var(--muted)" textAnchor={a}>{l}</text>
            </g>
          );
        })}
      </svg>
      <p className="note">Proyección lineal: no incluye rentabilidad ni cambios de sueldo.</p>
    </div>
  );
}
