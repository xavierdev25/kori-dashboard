"use client";

import { SlotText } from "slot-text/react";
import { useEffect, useState } from "react";
import "slot-text/style.css";

/**
 * Una cifra que rueda al cambiar, estilo marcador de aeropuerto.
 *
 * Dos cosas la envuelven en vez de usar `SlotText` a pelo:
 *
 * 1. `slot-text` 0.3.3 todavia no mira `prefers-reduced-motion` — su propia
 *    hoja de ruta lo da por pendiente. Aqui se comprueba y, si el sistema
 *    pide menos movimiento, se pinta el texto quieto.
 * 2. La animacion es solo del cliente. En el primer render se pinta texto
 *    plano para que el HTML del servidor y el del cliente coincidan; si no,
 *    React se queja de hidratacion. Rodar en la primera pintura tampoco
 *    aportaria nada: no hay valor anterior del que venir.
 * 3. Cada slot guarda a la vez la cara que sale y la que entra, asi que el
 *    texto real del nodo acaba siendo "$$22,,999955..0000". A la vista queda
 *    bien, pero un lector de pantalla leeria eso tal cual. Por eso la parte
 *    animada va `aria-hidden` y al lado queda la cifra de verdad, invisible.
 */
export function AnimatedNumber({
  className,
  value,
}: {
  className?: string;
  value: string;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!query.matches);

    apply();
    query.addEventListener("change", apply);

    return () => query.removeEventListener("change", apply);
  }, []);

  if (!animate) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      <SlotText
        aria-hidden
        // Las cifras de dinero son largas ("$2,995.00 MXN"): sin bajar el
        // escalonado, la ultima letra sale mucho despues que la primera y
        // parece que la pagina se ha quedado colgada.
        options={{ bounce: 0.35, stagger: 22 }}
        text={value}
      />
      <span className="sr-only">{value}</span>
    </span>
  );
}
