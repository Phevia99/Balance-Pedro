import { ImageResponse } from "next/og";

// Ícono de la app: fondo azul oscuro con 3 barras ascendentes (sin texto ni datos).
export function dibujarIcono(size: number) {
  const u = size / 10;
  const barras = [
    { h: 3.2, c: "#60a5fa" },
    { h: 5, c: "#34d399" },
    { h: 7, c: "#fbbf24" },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#0b1220",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: u * 0.6,
          paddingBottom: u * 1.7,
        }}
      >
        {barras.map((b, i) => (
          <div key={i} style={{ width: u * 1.7, height: u * b.h, background: b.c, borderRadius: u * 0.45 }} />
        ))}
      </div>
    ),
    { width: size, height: size },
  );
}
