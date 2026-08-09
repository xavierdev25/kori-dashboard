"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/Button";

/**
 * Confirmacion para acciones que no se pueden deshacer.
 *
 * El foco arranca en "Cancelar", no en el boton rojo: quien llega aqui de
 * rebote y pulsa Enter no debe borrar nada. Escape y el clic en el fondo
 * cierran, que es lo que todo el mundo intenta antes de buscar el boton.
 */
export function ConfirmDialog({
  confirmLabel = "Borrar",
  description,
  detail,
  isBusy = false,
  onClose,
  onConfirm,
  open,
  title,
}: {
  confirmLabel?: string;
  description: ReactNode;
  /** El dato concreto que se va a perder: se lee antes de pulsar. */
  detail?: string;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);
    cancelRef.current?.focus();

    // El fondo no debe poder desplazarse mientras el dialogo esta encima.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/55 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onClose();
        }
      }}
    >
      <div
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl"
        role="alertdialog"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
            <AlertTriangle aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2
              className="text-lg font-semibold text-neutral-950"
              id="confirm-dialog-title"
            >
              {title}
            </h2>
            <div
              className="mt-2 text-sm leading-6 text-neutral-600"
              id="confirm-dialog-description"
            >
              {description}
            </div>
            {detail ? (
              <p className="mt-3 break-words rounded-md bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800">
                {detail}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            disabled={isBusy}
            onClick={onClose}
            ref={cancelRef}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button isLoading={isBusy} onClick={onConfirm} variant="danger">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
