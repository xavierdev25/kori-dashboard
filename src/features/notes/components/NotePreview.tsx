import { forwardRef } from "react";
import type { AdminNote } from "@/features/notes/types/note.types";
import { DrawingNotePreview } from "@/features/notes/components/DrawingNotePreview";
import { TextNotePreview } from "@/features/notes/components/TextNotePreview";

interface NotePreviewProps {
  disableRotation?: boolean;
  note: AdminNote;
}

export const NotePreview = forwardRef<HTMLDivElement, NotePreviewProps>(
  function NotePreview({ disableRotation = false, note }, ref) {
    return (
      <div
        className="inline-flex min-h-[420px] min-w-[420px] items-center justify-center p-12"
        ref={ref}
      >
        {note.type === "DRAWING" ? (
          <DrawingNotePreview disableRotation={disableRotation} note={note} />
        ) : (
          <TextNotePreview disableRotation={disableRotation} note={note} />
        )}
      </div>
    );
  },
);
