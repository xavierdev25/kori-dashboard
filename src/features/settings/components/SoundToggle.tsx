"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/Card";
import { isSoundEnabled, setSoundEnabled } from "@/shared/lib/sound";

/**
 * Enciende o apaga los sonidos del panel.
 *
 * La preferencia se lee en un efecto y no en el estado inicial: localStorage
 * no existe en el servidor, y leerlo durante el render dejaria el HTML del
 * servidor distinto al del cliente.
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [cargado, setCargado] = useState(false);

  // Diferido un tick, igual que el resto de hooks del panel: React 19 prohibe
  // llamar a setState de forma sincrona dentro de un efecto.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEnabled(isSoundEnabled());
      setCargado(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  }

  return (
    <Card className="max-w-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-950">
            Sonidos del panel
          </h3>
          <p className="mt-1 text-sm leading-6 text-neutral-600">
            Un chasquido al pulsar y un aviso distinto cuando algo sale bien o
            falla. Se guarda en este navegador, no en la cuenta.
          </p>
        </div>

        <button
          aria-checked={enabled}
          aria-label="Sonidos del panel"
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-neutral-950" : "bg-neutral-300"
          } ${cargado ? "" : "opacity-50"}`}
          disabled={!cargado}
          onClick={toggle}
          role="switch"
          type="button"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </Card>
  );
}
