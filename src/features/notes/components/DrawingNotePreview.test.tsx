import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DrawingNotePreview } from "@/features/notes/components/DrawingNotePreview";
import type { AdminNote } from "@/features/notes/types/note.types";

afterEach(cleanup);

const dibujo: AdminNote = {
  color: null,
  createdAt: "2026-09-12T03:00:00.000Z",
  id: "n1",
  imageUrl: "https://cdn.example/drawings/2026-09-12/abc.png",
  message: null,
  recipientName: "Guillermo",
  rotation: 4,
  status: "PENDING",
  storagePath: "drawings/2026-09-12/abc.png",
  type: "DRAWING",
  zIndex: 5,
};

describe("DrawingNotePreview", () => {
  it("pinta el dibujo con su url", () => {
    render(<DrawingNotePreview note={dibujo} />);

    const img = screen.getByRole("img", { name: /dibujo para guillermo/i });

    expect(img.getAttribute("src")).toBe(dibujo.imageUrl);
  });

  it("no pide la imagen por CORS", () => {
    // Llevaba `crossOrigin="anonymous"` para que la exportacion a PNG no
    // ensuciara el canvas, y el precio era que el dibujo no se veia: el CDN
    // sirve estos archivos sin `access-control-allow-origin`, y entonces el
    // navegador tira la respuesta y deja solo el texto alternativo.
    //
    // Si algun dia se repone, que sea despues de arreglar el CDN y a
    // sabiendas de que esta prueba dice que no.
    render(<DrawingNotePreview note={dibujo} />);

    const img = screen.getByRole("img", { name: /dibujo para guillermo/i });

    expect(img.hasAttribute("crossorigin")).toBe(false);
  });

  it("sin url avisa en vez de dejar un hueco", () => {
    render(<DrawingNotePreview note={{ ...dibujo, imageUrl: null }} />);

    expect(screen.getByText("Imagen no disponible")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
