Quiero que construyas mi dashboard de patrimonio personal como un sitio web propio, para publicarlo en Vercel desde un repositorio PRIVADO de GitHub.

Lee primero, en este orden: `LEEME_PRIMERO.md`, `ESPECIFICACION.md`, `SEGURIDAD.md` y `VERIFICACION.md`. Los datos están en `data/`. El código original (`reference/dashboard-original.html`) es de otra plataforma: úsalo solo para copiar la lógica de los cálculos y el dibujo de los gráficos, no lo ejecutes tal cual.

Reglas:
1. Idioma: toda la interfaz en español de Chile. Números en formato chileno (miles con punto, decimales con coma, signo menos "−").
2. Debe verse bien en celular primero (ancho ~380 px) y también en escritorio. Sin scroll horizontal.
3. El dólar (USD→CLP) debe venir de una API pública desde el SERVIDOR (función de Vercel), nunca desde el navegador, con caché de hasta 24 horas. Si la API falla, usa `data/dolar-respaldo.json` y muestra la fecha del último dólar usado.
4. Seguridad: nada de mis montos puede ser accesible sin contraseña. Implementa lo que dice `SEGURIDAD.md` y compruébalo con `curl` sin credenciales antes de darme el link.
5. Para actualizar mis montos solo debo editar los JSON de `data/` (o pedírtelo) y hacer push. No quiero base de datos ni servicios de pago.
6. Mantén el proyecto simple: Next.js (App Router) o equivalente mínimo, JavaScript/TypeScript, gráficos con d3 o SVG propio. Sin librerías pesadas.
7. Al terminar: corre el sitio localmente, compara las cifras con `VERIFICACION.md`, y dime exactamente qué falta o qué difiere. Luego guíame paso a paso para conectar el repo a Vercel y definir las variables de entorno.

Antes de escribir código, resúmeme el plan en 10 líneas y espera mi OK.
