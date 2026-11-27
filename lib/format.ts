// Formato es-CL escrito a mano (no depende de los datos ICU del servidor).
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function miles(n: number): string {
  return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function clp(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "−" : "") + "$" + miles(r);
}

export function clpConSigno(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "−" : "+") + "$" + miles(r);
}

export function millones(n: number, dec = 1): string {
  return (n < 0 ? "−" : "") + "$" + (Math.abs(n) / 1e6).toFixed(dec).replace(".", ",") + " M";
}

export function usd(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "−" : "") + "US$" + miles(r);
}

export function usdConSigno(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "−" : "+") + "US$" + miles(r);
}

export function pct(x: number, signo = true): string {
  const s = (Math.abs(x) * 100).toFixed(1).replace(".", ",");
  return (signo ? (x < 0 ? "−" : "+") : x < 0 ? "−" : "") + s + "%";
}

export function pctSimple(x: number): string {
  return Math.round(x * 100) + "%";
}

export function tasaDolar(rate: number): string {
  const [e, d] = rate.toFixed(2).split(".");
  return "$" + miles(Number(e)) + "," + d;
}

export function fecha(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

export function mesCorto(iso: string): string {
  const [y, m] = iso.slice(0, 10).split("-").map(Number);
  return `${MESES[m - 1]} ${String(y).slice(2)}`;
}
