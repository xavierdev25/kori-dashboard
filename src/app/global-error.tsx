"use client";

/**
 * El ultimo recurso: solo entra si revienta el propio layout raiz.
 *
 * Reemplaza al layout entero, asi que tiene que traerse sus propias etiquetas
 * <html> y <body> — y no puede apoyarse en nada de lo que monta el layout
 * (los avisos, el registro de esqueletos), porque justo eso es lo que puede
 * haber fallado. Por eso los estilos van escritos aqui a mano en vez de con
 * las clases de siempre.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          alignItems: "center",
          background: "#f6f7f9",
          color: "#171717",
          display: "flex",
          fontFamily: "Arial, Helvetica, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1rem", margin: 0 }}>
            El panel no pudo arrancar
          </h1>
          <p
            style={{
              color: "#525252",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              margin: "8px 0 20px",
            }}
          >
            Vuelve a intentarlo. Si sigue igual, recarga la pagina.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              background: "#0a0a0a",
              border: "1px solid #0a0a0a",
              borderRadius: "6px",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.875rem",
              padding: "10px 16px",
            }}
            type="button"
          >
            Volver a intentar
          </button>
          {error.digest ? (
            <p
              style={{
                color: "#a3a3a3",
                fontSize: "0.75rem",
                marginTop: "16px",
              }}
            >
              Referencia: <code>{error.digest}</code>
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
