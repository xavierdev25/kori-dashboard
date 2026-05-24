/* eslint-disable @next/next/no-img-element */
import type { AdminNote } from "@/features/notes/types/note.types";
import { formatDate } from "@/features/notes/utils/format-date";
import { getNoteRotationStyle } from "@/features/notes/utils/note-rotation";

export function DrawingNotePreview({
  disableRotation = false,
  note,
}: {
  disableRotation?: boolean;
  note: AdminNote;
}) {
  return (
    <article
      className="w-80 rounded-md border border-neutral-200 bg-white p-4 shadow-lg"
      style={{
        transform: getNoteRotationStyle(note.rotation || 0, disableRotation),
      }}
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-neutral-100">
        {note.imageUrl ? (
          <img
            alt={`Dibujo para ${note.recipientName}`}
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
            src={note.imageUrl}
          />
        ) : (
          <span className="px-4 text-center text-sm font-medium text-neutral-500">
            Imagen no disponible
          </span>
        )}
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="break-words text-lg font-semibold text-neutral-950">
          {note.recipientName}
        </p>
        <time className="mt-1 block text-xs font-medium text-neutral-500">
          {formatDate(note.createdAt)}
        </time>
      </div>
    </article>
  );
}
