# Paquete: Balance Pedro → GitHub + Vercel (para Claude Code)

Este paquete tiene todo para reconstruir tu dashboard de patrimonio como un sitio web normal,
que se abra desde cualquier celular sin sesión de Claude, con el dólar automático.

## Cómo usarlo
1. Crea un repositorio **PRIVADO** en GitHub (importante: tiene tus montos reales).
2. Descomprime este paquete dentro de una carpeta del repositorio, abre Claude Code ahí.
3. Pégale el contenido de `PROMPT_PARA_CLAUDE_CODE.md`.
4. Revisa el resultado con la lista de `VERIFICACION.md` (trae las cifras esperadas).
5. Conecta el repo a Vercel y publica. Lee `SEGURIDAD.md` ANTES de publicar.

## Qué hay aquí
- `PROMPT_PARA_CLAUDE_CODE.md` — la instrucción para pegar.
- `ESPECIFICACION.md` — qué construir: secciones, fórmulas, textos, interacciones.
- `SEGURIDAD.md` — cómo evitar que tus montos queden públicos.
- `VERIFICACION.md` — cifras esperadas para comprobar que quedó igual.
- `data/` — tus datos (JSON). `dolar-respaldo.json` es el último dólar conocido.
- `reference/dashboard-original.html` — el código original (usa el motor de Claude `dash.*`, que no existe fuera: sirve para copiar la lógica, no para ejecutarlo).
- `reference/estilo-paleta.json` — colores y esquinas del estilo "Vivo claro".

Todos los montos son los que me indicaste el 27 de noviembre de 2026.
