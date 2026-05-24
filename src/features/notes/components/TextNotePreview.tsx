import type { AdminNote } from "@/features/notes/types/note.types";
import { formatDate } from "@/features/notes/utils/format-date";
import { getNoteRotationStyle } from "@/features/notes/utils/note-rotation";

const noteColors = {
  blue: { background: "#b9ddf2", border: "#7ab6d6" },
  green: { background: "#c8e8c7", border: "#8ac489" },
  pink: { background: "#f4bfd1", border: "#d7839e" },
  yellow: { background: "#f4df8a", border: "#d1b94f" },
};

export function TextNotePreview({
  disableRotation = false,
  note,
}: {
  disableRotation?: boolean;
  note: AdminNote;
}) {
  const color = noteColors[note.color || "yellow"] || noteColors.yellow;

  return (
    <article
      className="min-h-80 w-80 rounded-md border p-6 shadow-lg"
      style={{
        backgroundColor: color.background,
        borderColor: color.border,
        transform: getNoteRotationStyle(note.rotation || 0, disableRotation),
      }}
    >
      <div className="flex h-full min-h-64 flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">
          Para
        </p>
        <h2 className="mt-1 break-words text-2xl font-semibold text-neutral-950">
          {note.recipientName}
        </h2>

        <p className="mt-6 flex-1 whitespace-pre-wrap break-words text-lg leading-7 text-neutral-900">
          {note.message || "Sin mensaje"}
        </p>

        <time className="mt-6 text-xs font-medium text-neutral-700">
          {formatDate(note.createdAt)}
        </time>
      </div>
    </article>
  );
}
