import { describe, expect, it } from "vitest";
import { csvCell, signupsToCsv } from "./signal-csv";
import type { SignalSignup } from "@/features/signal/types/signal.types";

const ANA: SignalSignup = {
  createdAt: "2026-10-12T18:00:00.000Z",
  email: "ana@correo.com",
  id: "1",
  locale: "es",
  marketingOptIn: true,
  name: "Ana",
  privacyVersion: "2026-10-12",
};

describe("csvCell", () => {
  it("deja tal cual lo que no necesita comillas", () => {
    expect(csvCell("José Ángel")).toBe("José Ángel");
  });

  it("encierra comas, comillas y saltos de línea", () => {
    expect(csvCell("Ana, la de GDL")).toBe('"Ana, la de GDL"');
    expect(csvCell('el "kori"')).toBe('"el ""kori"""');
    expect(csvCell("a\nb")).toBe('"a\nb"');
  });

  it("neutraliza lo que una hoja de cálculo ejecutaría como fórmula", () => {
    expect(csvCell('=HYPERLINK("http://x","clic")')).toBe(
      '"\'=HYPERLINK(""http://x"",""clic"")"',
    );
    expect(csvCell("+52 33")).toBe("'+52 33");
    expect(csvCell("-1")).toBe("'-1");
    expect(csvCell("@kori")).toBe("'@kori");
  });
});

describe("signupsToCsv", () => {
  it("lleva BOM, cabecera y una fila por persona", () => {
    const csv = signupsToCsv([ANA, { ...ANA, id: "2", marketingOptIn: false, locale: "en" }]);

    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\n")).toEqual([
      "nombre,email,idioma,novedades,aviso_aceptado,fecha_registro",
      "Ana,ana@correo.com,es,si,2026-10-12,2026-10-12T18:00:00.000Z",
      "Ana,ana@correo.com,en,no,2026-10-12,2026-10-12T18:00:00.000Z",
    ]);
  });
});
