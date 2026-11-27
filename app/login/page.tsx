export const dynamic = "force-dynamic";

const MENSAJES: Record<string, string> = {
  denegado: "Ese correo no tiene acceso a este sitio.",
  cancelado: "Se canceló el inicio de sesión.",
  expirado: "El intento expiró. Vuelve a probar.",
  fallo: "No se pudo completar el inicio de sesión. Vuelve a probar.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main style={{ minHeight: "80vh", alignContent: "center" }}>
      <div className="card" style={{ textAlign: "center", padding: 24 }}>
        <h1 style={{ margin: 0 }}>Balance Pedro</h1>
        <p className="muted small">Acceso privado</p>
        {error && <p className="neg small">{MENSAJES[error] ?? MENSAJES.fallo}</p>}
        <a className="btn" href="/api/auth/login">
          Entrar con Google
        </a>
      </div>
    </main>
  );
}
