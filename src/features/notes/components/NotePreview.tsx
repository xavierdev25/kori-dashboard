import { forwardRef } from "react";
import type { AdminNote } from "@/features/notes/types/note.types";
import { DrawingNotePreview } from "@/features/notes/components/DrawingNotePreview";
import { TextNotePreview } from "@/features/notes/components/TextNotePreview";

export const NotePreview = forwardRef<HTMLDivElement, { note: AdminNote }>(
  function NotePreview({ note }, ref) {
    return (
      <div
        className="inline-flex min-h-[420px] min-w-[420px] items-center justify-center rounded-lg bg-background p-12"
        ref={ref}
      >
        {note.type === "DRAWING" ? (
          <DrawingNotePreview note={note} />
        ) : (
          <TextNotePreview note={note} />
        )}
      </div>
    );
  },
);
