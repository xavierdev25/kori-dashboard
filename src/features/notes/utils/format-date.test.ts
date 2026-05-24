import { describe, expect, it } from "vitest";
import { formatDate } from "@/features/notes/utils/format-date";

describe("formatDate", () => {
  it("handles empty values", () => {
    expect(formatDate(null)).toBe("Sin fecha");
    expect(formatDate(undefined)).toBe("Sin fecha");
  });

  it("handles invalid dates", () => {
    expect(formatDate("not-a-date")).toBe("Fecha no disponible");
  });

  it("formats valid dates", () => {
    expect(formatDate("2026-05-24T12:30:00.000Z")).toContain("2026");
  });
});
