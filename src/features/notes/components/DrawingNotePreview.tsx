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
          // Sin `crossOrigin`. Lo llevaba, para que html-to-image pudiera
          // exportar la notita a PNG sin ensuciar el canvas, y el efecto era
          // que el dibujo no se veia en absoluto: CloudFront sirve estos
          // archivos SIN cabecera `access-control-allow-origin`, y con
          // `crossOrigin="anonymous"` el navegador descarta una respuesta que
          // no la trae. Quedaba solo el texto alternativo.
          //
          // Medido desde panel.insecurekori.com: con el atributo la imagen
          // falla; sin el carga. La peticion devuelve 200 en los dos casos, y
          // por eso desde fuera no parecia un problema de permisos.
          //
          // Quitarlo no empeora la descarga: html-to-image se trae la imagen
          // por su cuenta con `fetch`, que tambien necesita esa cabecera, asi
          // que la exportacion ya estaba rota igual. Las dos se arreglan en el
          // mismo sitio —anadir CORS en CloudFront—, no aqui.
          <img
            alt={`Dibujo para ${note.recipientName}`}
            className="h-full w-full object-contain"
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
