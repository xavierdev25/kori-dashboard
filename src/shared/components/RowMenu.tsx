"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MoreHorizontal } from "@/shared/components/icons";

const ANCHO = 224;
const HUECO = 6;

type Posicion = { arriba: number; izquierda: number };

/**
 * El menu de acciones de una fila: los tres puntos y su lista.
 *
 * Va por portal al `body` y con posicion fija, no absoluta dentro de la fila.
 * La tabla vive en un contenedor con `overflow-x-auto`, y un `overflow` en un
 * eje convierte el otro en `auto` tambien: un desplegable colocado dentro
 * quedaria recortado por abajo justo en las ultimas filas, que son las que
 * mas se usan.
 *
 * Se cierra al desplazar la pagina en vez de recalcular la posicion mientras
 * tanto. Recalcular obliga a seguir el scroll de todos los antecesores y el
 * menu acaba flotando desalineado; cerrarlo es lo que el usuario espera de
 * todos modos cuando mueve la pagina por debajo.
 */
export function RowMenu({
  children,
  label,
}: {
  children: ReactNode;
  /** Lo que lee un lector de pantalla: "Acciones de Playera Kori". */
  label: string;
}) {
  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const abierto = posicion !== null;

  const cerrar = useCallback((devolverFoco = true) => {
    setPosicion(null);

    if (devolverFoco) {
      disparadorRef.current?.focus();
    }
  }, []);

  function abrir() {
    const caja = disparadorRef.current?.getBoundingClientRect();

    if (!caja) {
      return;
    }

    // Si no cabe debajo, se despliega hacia arriba. Sin esto, en la ultima
    // fila de una tabla larga el menu nace fuera de la ventana.
    const espacioDebajo = window.innerHeight - caja.bottom;
    const alto = 120;

    setPosicion({
      arriba:
        espacioDebajo < alto ? caja.top - alto - HUECO : caja.bottom + HUECO,
      izquierda: Math.max(HUECO, caja.right - ANCHO),
    });
  }

  useEffect(() => {
    if (!abierto) {
      return;
    }

    function alPulsarFuera(evento: PointerEvent) {
      const destino = evento.target as Node;

      if (
        !menuRef.current?.contains(destino) &&
        !disparadorRef.current?.contains(destino)
      ) {
        // Sin devolver el foco: quien pulsa fuera ya eligio donde quiere estar.
        cerrar(false);
      }
    }

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        cerrar();
        return;
      }

      if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") {
        return;
      }

      const opciones = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          [],
      );

      if (opciones.length === 0) {
        return;
      }

      evento.preventDefault();
      const actual = opciones.indexOf(document.activeElement as HTMLElement);
      const salto = evento.key === "ArrowDown" ? 1 : -1;
      const siguiente =
        (actual + salto + opciones.length) % opciones.length;

      opciones[siguiente]?.focus();
    }

    // Con nombre y no como flecha suelta: `removeEventListener` compara por
    // identidad, y una flecha creada en la llamada nunca se puede quitar.
    // Cada apertura dejaria dos oyentes vivos apuntando a un cierre viejo.
    const alMoverLaPagina = () => {
      cerrar(false);
    };

    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    // En captura: el scroll de un contenedor interno no burbujea.
    window.addEventListener("scroll", alMoverLaPagina, true);
    window.addEventListener("resize", alMoverLaPagina);

    menuRef.current
      ?.querySelector<HTMLElement>('[role="menuitem"]')
      ?.focus();

    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
      window.removeEventListener("scroll", alMoverLaPagina, true);
      window.removeEventListener("resize", alMoverLaPagina);
    };
  }, [abierto, cerrar]);

  return (
    <>
      <button
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-neutral-500 transition hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 aria-expanded:border-neutral-200 aria-expanded:bg-neutral-100"
        onClick={() => (abierto ? cerrar() : abrir())}
        ref={disparadorRef}
        type="button"
      >
        <MoreHorizontal aria-hidden className="h-4 w-4" />
      </button>

      {posicion
        ? createPortal(
            <div
              className="fixed z-50 min-w-[14rem] overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
              onClick={(evento) => {
                // Elegir una opcion cierra el menu. Se mira el destino real y
                // no se cierra a ciegas: un clic en el borde o en un separador
                // no es una eleccion.
                if (
                  (evento.target as HTMLElement).closest('[role="menuitem"]')
                ) {
                  cerrar(false);
                }
              }}
              ref={menuRef}
              role="menu"
              style={{ left: posicion.izquierda, top: posicion.arriba }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/** Una opcion del menu. `tone="danger"` para lo que no se puede deshacer. */
export function RowMenuItem({
  children,
  onSelect,
  tone = "default",
}: {
  children: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition focus:outline-none ${
        tone === "danger"
          ? "text-red-700 hover:bg-red-50 focus-visible:bg-red-50"
          : "text-neutral-800 hover:bg-neutral-50 focus-visible:bg-neutral-50"
      }`}
      onClick={onSelect}
      role="menuitem"
      type="button"
    >
      {children}
    </button>
  );
}
