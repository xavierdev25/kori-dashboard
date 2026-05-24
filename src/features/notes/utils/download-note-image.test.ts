import { afterEach, describe, expect, it, vi } from "vitest";
import { toPng } from "html-to-image";
import { downloadNoteImage } from "@/features/notes/utils/download-note-image";

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,test"),
}));

describe("downloadNoteImage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("converts an element to PNG and triggers a download", async () => {
    const element = document.createElement("div");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await downloadNoteImage(element, "kori-note-id.png");

    expect(toPng).toHaveBeenCalledWith(element, {
      cacheBust: true,
      pixelRatio: 2,
    });
    expect(click).toHaveBeenCalledOnce();
  });

  it("rejects when the element is missing", async () => {
    await expect(downloadNoteImage(null, "kori-note-id.png")).rejects.toThrow(
      "No se encontro la nota para descargar.",
    );
  });
});
