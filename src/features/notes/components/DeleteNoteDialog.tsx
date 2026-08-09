"use client";

import type { AdminNote } from "@/features/notes/types/note.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

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
  return (
    <ConfirmDialog
      description={
        note?.type === "DRAWING"
          ? "Se borra la nota y tambien su dibujo en Storage. No se puede deshacer."
          : "Se borra la nota de forma permanente. No se puede deshacer."
      }
      detail={note?.recipientName}
      isBusy={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
      open={open && Boolean(note)}
      title="Borrar nota"
    />
  );
}
