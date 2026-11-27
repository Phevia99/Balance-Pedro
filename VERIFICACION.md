# Verificación: cifras esperadas

Con el dólar = 1.038,61 y fecha de hoy = 27 de noviembre de 2026 (44 meses con sueldo pagado), el sitio debe mostrar:

| Concepto | Valor esperado |
|---|---|
| Etoro en pesos | $8.776.255 |
| Patrimonio total | $86.313.431 |
| Líquido | $63.813.431 |
| Acciones IBH | $22.500.000 |
| Ahorro mensual | $1.961.669 |
| Proyección a 12 meses | $109.853.458 |
| Deudas TC | −$31.332.237 (Visa $10.661.263 + Mastercard $20.670.974) |
| Deuda de Kaiken | $30.358.318 |
| Neto Kaiken − TC | −$973.919 |
| Banchile aportado | $41.435.832 (ETF $12.714.334 + fondos mutuos $28.721.498) |
| Banchile hoy / ganancia / rentabilidad | $52.500.000 / +$11.064.168 / +26,7% |
| Etoro rentabilidad | +US$622 (+7,9%) |
| Banco | $3.442.095 (cuentas $83.188 + $3.358.907) |
| Deudas de personas | $69.000 |
| Galan (ASX: GLN) | $0 |

Si el dólar o la fecha cambian, cambian Etoro, patrimonio, líquido, ahorro y proyección; el resto no.

Pruebas mínimas:
1. Formato chileno de números y signo menos.
2. Con el dólar de respaldo (simula que la API falla), el sitio sigue mostrando todo y avisa la fecha de ese dólar.
3. Cambiar 6 → 7 en `bonos_pagados` o un monto de `partidas.json` y reiniciar actualiza todo.
4. Se ve bien a 380 px de ancho, sin scroll horizontal.
5. Pruebas de `SEGURIDAD.md` punto 4 sin credenciales.
