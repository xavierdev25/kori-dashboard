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
    play("ready");
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
