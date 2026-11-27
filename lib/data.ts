// Los JSON se importan en el servidor: quedan dentro del código del servidor, nunca en /public.
import partidas from "../data/partidas.json";
import parametros from "../data/parametros.json";
import aportes from "../data/aportes.json";
import componentes from "../data/componentes.json";
import historial from "../data/historial.json";
import type { Aporte, Componente, Hoy, Params, Partida, Registro } from "./calc";

export const datos = {
  partidas: partidas as Partida[],
  params: (Array.isArray(parametros) ? parametros[0] : parametros) as Params,
  aportes: aportes as Aporte[],
  componentes: componentes as Componente[],
  historial: historial as Registro[],
};

export function hoyChile(): Hoy {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" })
    .format(new Date())
    .split("-")
    .map(Number);
  return { y, m, d };
}
