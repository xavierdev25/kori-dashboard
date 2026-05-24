"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import type { AdminNote } from "@/features/notes/types/note.types";
import { Button } from "@/shared/components/Button";

export function DeleteNoteDialog({
  isDeleting,
  note,
  onClose,
  onConfirm,
  open,
}: {
  isDeleting: boolean;
  note: AdminNote | null;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
}) {
  if (!open || !note) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/55 px-4 py-6">
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl"
        role="alertdialog"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
            <AlertTriangle aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">Borrar nota</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Esta accion eliminara la nota de PostgreSQL y, si es un dibujo, tambien
              su archivo asociado en Storage desde el backend.
            </p>
            <p className="mt-3 break-words rounded-md bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800">
              {note.recipientName}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isDeleting} onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button
            isLoading={isDeleting}
            leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={onConfirm}
            variant="danger"
          >
            Borrar
          </Button>
        </div>
      </div>
    </div>
  );
}
