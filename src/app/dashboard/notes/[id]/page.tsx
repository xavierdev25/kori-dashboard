"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, RefreshCcw, Trash2, Undo2 } from "@/shared/components/icons";
import { useRef, useState } from "react";
import { DeleteNoteDialog } from "@/features/notes/components/DeleteNoteDialog";
import { NotePreview } from "@/features/notes/components/NotePreview";
import { useNote } from "@/features/notes/hooks/useNotes";
import { notesService } from "@/features/notes/services/notes.service";
import { formatDate } from "@/features/notes/utils/format-date";
import { downloadNoteImage } from "@/features/notes/utils/download-note-image";
import { Badge } from "@/shared/components/Badge";
import { Button, buttonVariants } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageLoader } from "@/shared/components/Spinner";
import { getErrorText } from "@/shared/lib/error-message";
import { cn } from "@/shared/utils/cn";

function getParamId(id: string | string[] | undefined) {
  return Array.isArray(id) ? id[0] : id || null;
}

export default function NoteDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const id = getParamId(params.id);
  const previewRef = useRef<HTMLDivElement>(null);
  const { error, loading, note, refresh } = useNote(id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  async function handleDownload() {
    if (!note) {
      return;
    }

    setIsDownloading(true);
    setFeedback(null);

    try {
      await downloadNoteImage(previewRef.current, `kori-note-${note.id}.png`);
      setFeedback({ message: "Descarga generada.", tone: "success" });
    } catch (error) {
      setFeedback({
        message: getErrorText(error, "No se pudo descargar la nota."),
        tone: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleApprove() {
    if (!note) {
      return;
    }

    setIsApproving(true);
    setFeedback(null);

    try {
      await notesService.approveNote(note.id);
      setFeedback({
        message: "Nota aprobada: ya es visible en el muro.",
        tone: "success",
      });
      await refresh();
    } catch (error) {
      setFeedback({
        message: getErrorText(error, "No se pudo aprobar la nota."),
        tone: "error",
      });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    if (!note) {
      return;
    }

    setIsRejecting(true);
    setFeedback(null);

    try {
      await notesService.rejectNote(note.id);
      setFeedback({
        message: "Nota quitada del muro: vuelve a quedar pendiente.",
        tone: "success",
      });
      await refresh();
    } catch (error) {
      setFeedback({
        message: getErrorText(error, "No se pudo quitar la nota del muro."),
        tone: "error",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  async function handleDelete() {
    if (!note) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      await notesService.deleteNote(note.id);
      router.replace("/dashboard/notes");
    } catch (error) {
      setFeedback({
        message: getErrorText(error, "No se pudo borrar la nota."),
        tone: "error",
      });
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <PageLoader label="Cargando nota" />
    );
  }

  if (error || !note) {
    return (
      <EmptyState
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              className={buttonVariants({ variant: "secondary" })}
              href="/dashboard/notes"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              <span>Volver</span>
            </Link>
            <Button
              leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
              onClick={refresh}
              variant="secondary"
            >
              Reintentar
            </Button>
          </div>
        }
        description={error || "La nota solicitada no esta disponible."}
        title="No se pudo cargar la nota"
      />
    );
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-950"
            href="/dashboard/notes"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            <span>Volver al listado</span>
          </Link>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            Detalle de nota
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Vista previa visual y metadata administrativa.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {note.status === "PENDING" ? (
            <Button
              isLoading={isApproving}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              onClick={handleApprove}
            >
              Aprobar
            </Button>
          ) : (
            <Button
              isLoading={isRejecting}
              leftIcon={<Undo2 aria-hidden className="h-4 w-4" />}
              onClick={handleReject}
              variant="secondary"
            >
              Quitar del muro
            </Button>
          )}
          <Button
            isLoading={isDownloading}
            leftIcon={<Download aria-hidden className="h-4 w-4" />}
            onClick={handleDownload}
            variant="secondary"
          >
            Descargar
          </Button>
          <Button
            leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => setDeleteOpen(true)}
            variant="danger"
          >
            Borrar nota
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={cn(
            "rounded-md border px-4 py-3 text-sm font-medium",
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-[460px] justify-center">
            <NotePreview disableRotation note={note} ref={previewRef} />
          </div>
        </div>

        <Card className="h-fit p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-neutral-950">Metadata</h3>
            <div className="flex flex-wrap gap-1.5">
              {note.type === "DRAWING" ? (
                <Badge tone="blue">Dibujo</Badge>
              ) : (
                <Badge tone="green">Texto</Badge>
              )}
              {note.status === "PENDING" ? (
                <Badge tone="pink">Pendiente</Badge>
              ) : (
                <Badge tone="neutral">Aprobada</Badge>
              )}
            </div>
          </div>

          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-neutral-500">ID</dt>
              <dd className="mt-1 break-all font-mono text-neutral-950">{note.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500">Tipo</dt>
              <dd className="mt-1 text-neutral-950">{note.type}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500">Estado</dt>
              <dd className="mt-1 text-neutral-950">{note.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500">Creada</dt>
              <dd className="mt-1 text-neutral-950">{formatDate(note.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500">Destinatario</dt>
              <dd className="mt-1 break-words text-neutral-950">{note.recipientName}</dd>
            </div>
            {note.imageUrl ? (
              <div>
                <dt className="font-medium text-neutral-500">imageUrl</dt>
                <dd className="mt-1 break-all text-neutral-950">
                  <a
                    className="text-sky-700 underline-offset-2 hover:underline"
                    href={note.imageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {note.imageUrl}
                  </a>
                </dd>
              </div>
            ) : null}
            {note.storagePath ? (
              <div>
                <dt className="font-medium text-neutral-500">storagePath</dt>
                <dd className="mt-1 break-all font-mono text-neutral-950">
                  {note.storagePath}
                </dd>
              </div>
            ) : null}
          </dl>
        </Card>
      </div>

      <DeleteNoteDialog
        isDeleting={isDeleting}
        note={note}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        open={deleteOpen}
      />
    </section>
  );
}
