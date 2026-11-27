# Seguridad: que tus montos no queden públicos

> **Actualización:** el acceso ya no es Basic Auth. Ahora se entra con **Google** y solo los correos de
> `lib/auth.ts` (`CORREOS_PERMITIDOS`). Variables en Vercel: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`
> (≥ 32 caracteres). Si falta alguna, el sitio responde 503 (cerrado). Para dar o quitar acceso, edita esa lista y
> haz push: la lista se comprueba en cada request, así que quitar un correo cierra su sesión al instante.
> Las secciones de abajo sobre Basic Auth / `SITE_PASSWORD` quedan como referencia histórica.

Un sitio en Vercel es **público por defecto**. Este dashboard contiene tus cuentas, deudas y patrimonio.

## Obligatorio
1. **Repositorio de GitHub PRIVADO.** Nunca público. Si alguna vez fue público, asume que los datos se filtraron.
2. **Proteger el sitio con contraseña.** Opciones (elige una y verifícala):
   - Recomendada: middleware de Next.js con **Basic Auth** (usuario fijo + clave en la variable de entorno `SITE_PASSWORD`,
     definida en Vercel, NO escrita en el repo). El matcher debe cubrir TODAS las rutas, incluidos los archivos estáticos y la API.
   - Alternativa: la protección por contraseña propia de Vercel. Algunas modalidades dependen del plan: confirma qué incluye el tuyo.
3. **Los datos no deben poder descargarse sin clave.** No pongas los JSON dentro de `public/`. Léelos en el servidor
   (o sírvelos por una ruta protegida). Cuidado con que los montos terminen incrustados en archivos estáticos públicos del build.
4. **Prueba sin credenciales** (obligatorio antes de entregar el link):
   - `curl -i https://TU-SITIO.vercel.app/` → debe responder 401, sin montos en el cuerpo.
   - `curl -i https://TU-SITIO.vercel.app/api/...` (todas las rutas) → 401.
   - Buscar en la respuesta un monto conocido (por ejemplo `52.500.000` o `52500000`): no debe aparecer.
5. Añade `.env*` a `.gitignore`. No subas claves ni tokens.
6. Desactiva la indexación: encabezado `X-Robots-Tag: noindex` y `<meta name="robots" content="noindex">`.

## Recomendado
- Usa una clave larga y única (gestor de contraseñas). Rótala si la compartes.
- Revisa en Vercel que las previsualizaciones de ramas (preview deployments) también estén protegidas, o desactívalas.
- Si dejas de usar el sitio, elimínalo en Vercel y borra el repo.

## Lo que NO hace esta protección
- Quien tenga la clave verá todo. Quien tenga el repo verá todo.
- La API de tipo de cambio es pública y no recibe ningún dato tuyo: solo se pide USD→CLP.
