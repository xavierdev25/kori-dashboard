import { describe, expect, it } from "vitest";
import { csvCell, signupsToCsv } from "./signal-csv";
import type { SignalSignup } from "@/features/signal/types/signal.types";

const ANA: SignalSignup = {
  ageConfirmed: false,
  city: null,
  country: null,
  createdAt: "2026-10-12T18:00:00.000Z",
  email: "ana@correo.com",
  eventZone: false,
  id: "1",
  locale: "es",
  marketingOptIn: true,
  name: "Ana",
  privacyVersion: "2026-10-12",
  region: null,
  source: "senal",
};

const LUIS: SignalSignup = {
  ...ANA,
  ageConfirmed: true,
  city: "Zapopan",
  country: "MX",
  email: "luis@correo.com",
  eventZone: true,
  id: "3",
  name: null,
  privacyVersion: "2026-11-21",
  region: "Jalisco",
  source: "experiencia",
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
      "nombre,email,idioma,novedades,origen,pais,estado,ciudad,zona_evento,edad_confirmada,aviso_aceptado,fecha_registro",
      "Ana,ana@correo.com,es,si,senal,,,,no,no,2026-10-12,2026-10-12T18:00:00.000Z",
      "Ana,ana@correo.com,en,no,senal,,,,no,no,2026-10-12,2026-10-12T18:00:00.000Z",
    ]);
  });

  it("los registros de la experiencia: sin nombre, con ubicación y zona", () => {
    const csv = signupsToCsv([LUIS]);
    expect(csv.slice(1).split("\n")[1]).toBe(
      ",luis@correo.com,es,si,experiencia,MX,Jalisco,Zapopan,si,si,2026-11-21,2026-10-12T18:00:00.000Z",
    );
  });
});
