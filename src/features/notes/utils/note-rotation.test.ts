import { describe, expect, it } from "vitest";
import { getNoteRotationStyle } from "@/features/notes/utils/note-rotation";

describe("getNoteRotationStyle", () => {
  it("returns a rotate string when rotation is enabled", () => {
    expect(getNoteRotationStyle(15, false)).toBe("rotate(15deg)");
  });

  it("returns rotate(0deg) when rotation is 0 and not disabled", () => {
    expect(getNoteRotationStyle(0, false)).toBe("rotate(0deg)");
  });

  it("returns undefined when disableRotation is true", () => {
    expect(getNoteRotationStyle(15, true)).toBeUndefined();
  });

  it("returns undefined for zero rotation when disableRotation is true", () => {
    expect(getNoteRotationStyle(0, true)).toBeUndefined();
  });
});
