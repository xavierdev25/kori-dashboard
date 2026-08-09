"use client";

import { bind, play, setEnabled, setVolume } from "cuelume";
import type { SoundName } from "cuelume";

const STORAGE_KEY = "kori.sonidos";

/**
 * Los sonidos del panel.
 *
 * cuelume sintetiza cada cue con Web Audio en el momento: no hay ficheros que
 * descargar. El paquete guarda si esta activado en memoria, pero la
 * preferencia la persiste la app — por eso este modulo.
 *
 * Van encendidos por defecto y se apagan desde Ajustes. La decision se guarda
 * en localStorage y no en el servidor a proposito: es una preferencia de este
 * navegador, no de la cuenta.
 */

let iniciado = false;

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSoundEnabled(value: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  setEnabled(value);

  // Un sonido al encender confirma que funciona; al apagar, silencio.
  if (value) {
    play("toggle");
  }
}

/**
 * Arranca el sistema. Se llama una vez desde el layout del panel.
 *
 * `bind()` engancha por delegacion los atributos `data-cuelume-*`, asi que
 * los botones que se pinten despues tambien suenan sin volver a escanear.
 */
export function initSound(): void {
  if (iniciado || typeof window === "undefined") {
    return;
  }

  iniciado = true;
  setVolume(0.35);
  setEnabled(isSoundEnabled());
  bind();
}

/**
 * Suena un cue. Es seguro llamarlo desde cualquier sitio: si el usuario los
 * apago, cuelume no reproduce nada.
 */
export function cue(name: SoundName): void {
  play(name);
}

/**
 * Qué significa cada sonido en el panel.
 *
 * cuelume trae diecisiete cues, y cada uno tiene su forma: no son diecisiete
 * variantes del mismo clic. Repartirlos es lo que convierte el sonido en
 * informacion — sabes que ha pasado sin mirar. Si todo sonara igual, daria
 * lo mismo tener uno.
 *
 * La regla al repartirlos fue la frecuencia: lo que se oye cien veces al dia
 * (pulsar, soltar, pasar por encima) lleva los cues mas neutros y cortos; lo
 * que pasa una vez a la semana (publicar un producto, exportar la lista) se
 * queda los mas caracteristicos, que es donde lucen sin cansar.
 */
export const CUE = {
  /** Una nota entra al muro. */
  aprobado: "sparkle",
  /** Algo se anade a una lista: una variante, una imagen. */
  anadido: "droplet",
  /** Un aviso que no es un error: hay algo esperando atencion. */
  atencion: "pulse",
  /** Accion destructiva. Apagado a proposito: no se celebra un borrado. */
  borrar: "whisper",
  /** Sesion iniciada. */
  entrar: "arrival",
  /** El CSV ya esta en el disco. */
  exportado: "chime",
  fallo: "error",
  /** Un filtro o una busqueda acaban de recortar la lista. */
  filtrado: "scan",
  guardado: "success",
  /** Arranca algo que va a tardar. */
  ocupado: "loading",
  /** Cambio de seccion. */
  navegar: "page",
  /** El producto sale a la venta. El momento mas alegre del panel. */
  publicado: "bloom",
  pulsar: "press",
  /** Termino lo que tardaba. */
  listo: "ready",
  soltar: "release",
  /** El raton pasa por encima de algo pulsable. */
  pasar: "tick",
  /** Un interruptor cambia de estado. */
  alternar: "toggle",
} as const satisfies Record<string, SoundName>;
