# Especificación del dashboard "Balance Pedro"

## Datos (carpeta `data/`)
- `partidas.json`: `{cuenta, tipo, monto_clp, detalle}` por cuenta (Banchile, Banco, Deuda de Kaiken,
  Deudas de personas, Galan (ASX: GLN), Acciones IBH, Deudas TC). **Etoro NO está aquí**: se calcula en dólares.
  `tipo` ∈ inversion | banco | por_cobrar | planeada | acciones_empresa | deuda.
- `parametros.json` (una fila): `inicio` ("2023-03"), `bonos_pagados` (6), `bono_quarter_clp` (3750000),
  `proximo_bono` ("2026-12"), `etoro_inicio_usd` (7828), `etoro_actual_usd` (8450), `etoro_desde` ("2023-04-01").
- `aportes.json`: aportes a Banchile `{instrumento, tipo (ETF | Fondos mutuos), aporte_clp}`.
- `componentes.json`: de qué está hecha cada cuenta `{cuenta, componente, monto_clp}`
  (Banco, Deudas TC, Acciones IBH, Deuda de Kaiken, Deudas de personas).
- `historial.json`: registros reales de patrimonio `{fecha "YYYY-MM-DD", patrimonio_clp, nota}`.
- `dolar-respaldo.json`: último USD→CLP conocido, mismo formato que devuelve la API (`rate`).

## Fórmulas (funciones puras, fáciles de probar)
- `cuentas` = partidas con la fila Etoro insertada en 2.ª posición:
  `monto_clp = round(etoro_actual_usd × dolar)`; detalle: "Acciones en EE.UU.: US$8.450 al dólar de $1.038,61".
  (`tipo` = inversion.)
- `patrimonio` = suma de `monto_clp` de todas las cuentas (las deudas son negativas).
- `acciones` = monto de las cuentas con tipo `acciones_empresa`; `liquido` = patrimonio − acciones.
- `meses` = meses completos con sueldo pagado desde `inicio` hasta el mes ANTERIOR al actual
  (el mes en curso aún no se paga): `(añoActual − añoInicio)×12 + mesActual(1-12) − mesInicio`. Hoy (nov 2026) = 44.
- `ahorro` (mensual) = patrimonio ÷ meses.
- `kaiken` = monto de la cuenta "Deuda de Kaiken"; `deuda_tc` = suma de cuentas con tipo `deuda`;
  `neto_tc_kaiken` = kaiken + deuda_tc.
- Etoro: `rent_usd = actual − inicio`; `rent_pct = rent_usd ÷ inicio`.
- Banchile: `aportado` = suma de aportes; `valor` = monto de "Banchile Inversiones"; `ganancia = valor − aportado`;
  `rent_pct = ganancia ÷ aportado`; `aporte_etf` y `aporte_fm` = sumas por tipo.
- Proyección: para m = 0..12, `patrimonio + ahorro × m`.
- Serie estimada de historia: para k = 1..meses, punto en el ÚLTIMO día del mes k (mes 1 = `inicio`), valor `ahorro × k`,
  tipo "estimado". Más los puntos de `historial.json`, tipo "real". Ordenados por fecha.
  IMPORTANTE: la línea estimada NO son datos reales; la interfaz debe decirlo claramente.
- Desglose por sector (por cada cuenta): sus componentes. Banchile: cada aporte + "Ganancia acumulada" (= ganancia).
  Etoro: "Aportado (inicio)" = round(etoro_inicio_usd × dolar) y "Ganancia acumulada" = resto.
  Si los componentes no suman el monto de la cuenta, añadir una fila "Sin desglosar" con la diferencia.

## Pantalla, de arriba a abajo
1. **Título** "Balance Pedro".
2. **Tarjeta de resumen** (lo primero que se ve): cubitos, uno por cuenta (incluye las de $0 y las deudas).
   Orden: positivas de mayor a menor, luego las de $0, luego las negativas. Cada cubito: nombre, monto exacto y debajo
   "N% de tus activos" (activos = suma de positivas), "Deuda" (negativas) o "Sin monto por ahora" ($0).
   Estilo brillante: degradado claro del color de la cuenta, franja superior de 6 px, sombra del mismo color,
   texto oscuro siempre legible; deudas en rojo. Al tocar un cubito con monto, baja al desglose con ese sector seleccionado.
   Debajo de los cubitos, grande y destacado: **Patrimonio total**, con la nota
   "Líquido + acciones IBH, con las deudas ya descontadas".
3. **Frase**: "Tu patrimonio crece a un ritmo de {ahorro} al mes: hoy suma {patrimonio}, y a este paso llegaría a
   {proyección a 12 meses} en un año." Las cifras resaltadas con fondo verde suave.
4. **"Cómo ha ido subiendo tu patrimonio"**: gráfico tipo acción. Botones Todo / 1 año / 6 meses. Línea estimada punteada
   con área suave; puntos reales sólidos (y línea sólida si hay 2 o más). Cursor o dedo: línea vertical + valor + fecha +
   "estimado" o "registro real". Encabezado: valor final y variación del período (estimada). Eje Y a la derecha en "$XX M".
   Nota: la línea punteada es una estimación que supone el mismo ahorro cada mes; los puntos son registros reales.
5. **"Hacia dónde va tu patrimonio en 12 meses"**: línea de la proyección, etiquetas en Hoy / 6 m / 12 m.
   Nota: proyección lineal, sin rentabilidad ni cambios de sueldo.
6. **"De qué está hecho lo que tienes"**: una barra de 52 px dividida por cuenta (solo positivas) + leyenda con monto y %.
   Texto debajo: tarjetas, Kaiken, neto, líquido, acciones IBH.
7. **"Desglose por sector"**: lista de sectores (botón con nombre, monto y barra gruesa) y, debajo, el detalle del seleccionado:
   título con monto, % de activos, detalle, rentabilidad si hay ganancia, y una barra por componente.
8. **"Tus inversiones: aportado frente a hoy"**: Banchile (aportado vs valor hoy, con rentabilidad) y Etoro (inicio vs hoy en USD,
   con rentabilidad, dólar usado y su fecha, y el aviso "tipo de cambio de referencia, no el precio exacto de Etoro").
9. **"Detalle de partidas"**: tabla cuenta / monto / detalle.
10. **Pie**: "Montos al {fecha de los datos}. Dólar del {fecha del dólar}."

## Estilo ("Vivo claro")
- Colores y esquinas en `reference/estilo-paleta.json` (claro y oscuro; respetar `prefers-color-scheme`).
- Fondo azul muy claro, tarjetas blancas con sombra suave, esquinas de 16 px, títulos de sección en semibold.
- Barras GRUESAS (24–26 px en los gráficos de barras, 16 px en el desglose) con puntas redondeadas;
  un color distinto por cuenta.
- Cifras grandes en tipografía serif; números con `font-variant-numeric: tabular-nums`.
- Cada gráfico con tooltip dentro de su caja; los valores impresos sobre las barras, no solo en el tooltip.
- Legible en celular (~380 px) y en escritorio, sin scroll horizontal.

## Reglas de formato (es-CL)
- CLP: `$52.500.000`; negativos `−$31.332.237`. Millones: `$86,3 M`. Dólares: `US$8.450`. Porcentajes con signo y 1 decimal: `+26,7%`.
- Fechas: "27 nov 2026", meses abreviados en español.

## Dólar
- USD→CLP desde una API pública, consultada en el servidor, con caché de hasta 24 h.
- Frankfurter (gratuita) publica el tipo de cambio observado del Banco Central de Chile; endpoint de ejemplo para USD/CLP:
  `https://api.frankfurter.dev/v2/providers/bcch/rate/usd/clp` (alternativa: `https://api.frankfurter.dev/v2/rate/USD/CLP`).
  Verifica la forma exacta de la respuesta antes de usarla y no confíes en la de este documento.
- Si la API falla: usar `data/dolar-respaldo.json` y mostrar su fecha.
