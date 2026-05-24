"use client";

import Link from "next/link";
import { Eye, RefreshCcw, Trash2, Download } from "lucide-react";
import { useRef, useState } from "react";
import type { AdminNote } from "@/features/notes/types/note.types";
import { formatDate } from "@/features/notes/utils/format-date";
import { downloadNoteImage } from "@/features/notes/utils/download-note-image";
import { NotePreview } from "@/features/notes/components/NotePreview";
import { Badge } from "@/shared/components/Badge";
import { Button, buttonVariants } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Spinner } from "@/shared/components/Spinner";

function NoteTypeBadge({ note }: { note: AdminNote }) {
  return note.type === "DRAWING" ? (
    <Badge tone="blue">Dibujo</Badge>
  ) : (
    <Badge tone="green">Texto</Badge>
  );
}

function NoteDownloadButton({
  note,
  onFeedback,
}: {
  note: AdminNote;
  onFeedback?: (message: string, tone: "success" | "error") => void;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      await downloadNoteImage(previewRef.current, `kori-note-${note.id}.png`);
      onFeedback?.("Descarga generada.", "success");
    } catch {
      onFeedback?.("No se pudo descargar la nota.", "error");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <Button
        aria-label={`Descargar nota ${note.id}`}
        isLoading={isDownloading}
        leftIcon={<Download aria-hidden className="h-4 w-4" />}
        onClick={handleDownload}
        size="sm"
        variant="secondary"
      >
        Descargar
      </Button>
      <div className="pointer-events-none fixed left-[-10000px] top-0">
        <NotePreview note={note} ref={previewRef} />
      </div>
    </>
  );
}

export function NotesTable({
  error,
  loading,
  notes,
  onDelete,
  onFeedback,
  onRefresh,
}: {
  error: string | null;
  loading: boolean;
  notes: AdminNote[];
  onDelete: (note: AdminNote) => void;
  onFeedback?: (message: string, tone: "success" | "error") => void;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-neutral-200 bg-white">
        <Spinner label="Cargando notas" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <Button
            leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
            onClick={onRefresh}
            variant="secondary"
          >
            Reintentar
          </Button>
        }
        description={error}
        title="No se pudo cargar el listado"
      />
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        description="Ajusta los filtros o espera nuevas notas publicas desde la landing."
        title="No hay notas para mostrar"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Destinatario</th>
              <th className="px-4 py-3">Contenido</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {notes.map((note) => (
              <tr className="align-middle hover:bg-neutral-50/80" key={note.id}>
                <td className="px-4 py-4">
                  <NoteTypeBadge note={note} />
                </td>
                <td className="max-w-52 px-4 py-4 font-medium text-neutral-950">
                  <span className="line-clamp-2 break-words">{note.recipientName}</span>
                </td>
                <td className="max-w-sm px-4 py-4 text-neutral-600">
                  {note.type === "DRAWING" ? (
                    <span>Dibujo adjunto</span>
                  ) : (
                    <span className="line-clamp-2 break-words">
                      {note.message || "Sin mensaje"}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-neutral-600">
                  {formatDate(note.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      aria-label={`Ver detalle de nota ${note.id}`}
                      className={buttonVariants({ size: "sm", variant: "secondary" })}
                      href={`/dashboard/notes/${note.id}`}
                    >
                      <Eye aria-hidden className="h-4 w-4" />
                      <span>Ver</span>
                    </Link>
                    <NoteDownloadButton note={note} onFeedback={onFeedback} />
                    <Button
                      leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                      onClick={() => onDelete(note)}
                      size="sm"
                      variant="danger"
                    >
                      Borrar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
