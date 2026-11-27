export const colorDe = (c: { monto_clp: number; color: number }) =>
  c.monto_clp < 0 ? "var(--bad)" : `var(--c${c.color % 8})`;
