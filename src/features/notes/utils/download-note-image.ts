import { toPng } from "html-to-image";

export async function downloadNoteImage(element: HTMLElement | null, fileName: string) {
  if (!element) {
    throw new Error("No se encontro la nota para descargar.");
  }

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.rel = "noopener";
  link.click();
}
