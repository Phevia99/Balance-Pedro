import { calcular } from "../lib/calc";
import { datos, hoyChile } from "../lib/data";
import { obtenerDolar } from "../lib/dolar";
import { clp, fecha } from "../lib/format";
import Tiles from "../components/Tiles";
import Historia from "../components/Historia";
import Proyeccion from "../components/Proyeccion";
import Composicion from "../components/Composicion";
import Desglose from "../components/Desglose";
import Inversiones from "../components/Inversiones";

export const dynamic = "force-dynamic"; // la fecha de hoy cambia los meses transcurridos

export default async function Page() {
  const dolar = await obtenerDolar();
  const r = calcular({ ...datos, dolar, hoy: hoyChile() });
  const fechaDatos = datos.historial.map((h) => h.fecha).sort().at(-1) ?? dolar.date;

  return (
    <main>
      <h1>Balance Pedro</h1>

      <section className="card">
        <Tiles cuentas={r.orden} />
        <div className="total">
          <div className="lbl">Patrimonio total</div>
          <div className="big" style={{ color: r.patrimonio < 0 ? "var(--bad)" : undefined }}>{clp(r.patrimonio)}</div>
          <div className="small muted">Líquido + acciones IBH, con las deudas ya descontadas</div>
        </div>
      </section>

      <p className="card frase">
        Tu patrimonio crece a un ritmo de <span className="hl">{clp(r.ahorro)}</span> al mes: hoy suma{" "}
        <span className="hl">{clp(r.patrimonio)}</span>, y a este paso llegaría a{" "}
        <span className="hl">{clp(r.proyeccion12)}</span> en un año.
      </p>

      <Historia serie={r.serie} />
      <Proyeccion puntos={r.proyeccion} />
      <Composicion r={r} />
      <Desglose cuentas={r.orden} />
      <Inversiones r={r} />

      <section className="card">
        <h2>Detalle de partidas</h2>
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr><th>Cuenta</th><th className="num">Monto</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              {r.cuentas.map((c) => (
                <tr key={c.cuenta}>
                  <td>{c.cuenta}</td>
                  <td className="num" style={{ color: c.monto_clp < 0 ? "var(--bad)" : undefined }}>{clp(c.monto_clp)}</td>
                  <td className="muted">{c.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="pie">
        Montos al {fecha(fechaDatos)}. Dólar del {fecha(dolar.date)}.
        {dolar.fuente === "respaldo" && <span className="aviso"> (No se pudo consultar la API: se usa el último dólar guardado.)</span>}
      </p>
      <form action="/api/auth/logout" method="post" style={{ textAlign: "center" }}>
        <button className="salir" type="submit">Cerrar sesión</button>
      </form>
    </main>
  );
}
