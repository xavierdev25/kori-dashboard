"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * El logo de Kori rehecho en particulas, detras del formulario de acceso.
 *
 * Solo vive aqui. Arrastra three.js, que no es ligero, y las pantallas de
 * trabajo no tienen por que pagarlo: al login se entra una vez y se sale.
 *
 * De todo el catalogo de Canvas UI este es de los pocos que no depende de la
 * API `html-in-canvas`, que hoy pide activar una bandera en Chrome o un token
 * de prueba de origen atado al dominio. Este es WebGL normal: se ve igual en
 * Safari, en Firefox y en el Chrome de cualquiera.
 */

// ssr: false porque WebGL no existe en el servidor. Next lo permite solo
// dentro de un componente de cliente, que es lo que es este fichero.
const ParticleObject = dynamic(
  () =>
    import("@/shared/components/canvasui/ParticleObject").then(
      (m) => m.ParticleObject,
    ),
  { ssr: false },
);

export function LoginBackdrop() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Si el sistema pide menos movimiento, no se monta nada: no hay forma
      // de tener esto quieto y que siga teniendo sentido.
      const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Sin WebGL tampoco: mejor el fondo liso que un lienzo negro.
      const lienzo = document.createElement("canvas");
      const hayWebGL = Boolean(
        lienzo.getContext("webgl2") ?? lienzo.getContext("webgl"),
      );

      setMostrar(!quieto && hayWebGL);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!mostrar) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <ParticleObject
        autoRotate
        autoRotateSpeed={0.35}
        // Gris claro: tiene que leerse como textura del fondo y no competir
        // con la tarjeta de acceso, que es a lo que se viene.
        color="#c8c8d0"
        count={14000}
        orbit={false}
        // Grande a proposito. Con la escala pequena el logo cabia entero
        // detras de la tarjeta y no se veia ni un pixel; asi asoma por
        // arriba y por abajo, que es donde hay sitio.
        scale={6}
        size={2}
        src="/kori-logo.svg"
        style={{ height: "min(96vh, 900px)", width: "min(96vw, 900px)" }}
        zoom={false}
      />
    </div>
  );
}
