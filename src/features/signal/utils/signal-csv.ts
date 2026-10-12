import type { SignalSignup } from "@/features/signal/types/signal.types";

/**
 * Una celda de CSV que se puede abrir en Excel o Google Sheets sin sorpresas.
 *
 * Dos cosas, y la segunda es de seguridad:
 *   - Comas, comillas o saltos de línea van entre comillas, con las comillas
 *     dobladas. Si no, "Ana, la de GDL" partiría la fila en dos columnas.
 *   - El nombre lo escribe cualquiera en la landing. Una celda que empieza
 *     por `=`, `+`, `-`, `@` (o tabulador / retorno) la ejecuta la hoja de
 *     cálculo como fórmula: `=HYPERLINK(...)` en un nombre es un enlace que el
 *     equipo podría pulsar sin saberlo. Se neutraliza con una comilla delante,
 *     que es lo que recomienda OWASP para la "CSV injection".
 */
export function csvCell(value: string): string {
  const neutral = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  return /[",\n\r]/.test(neutral) ? `"${neutral.replace(/"/g, '""')}"` : neutral;
}

/**
 * El CSV para escribir los correos personales: una fila por persona, con el
 * nombre con el que saludarla y el idioma en el que escribirle.
 *
 * Empieza con BOM a propósito: sin él, Excel abre el UTF-8 como si fuera
 * Latin-1 y "José" sale como "JosÃ©" justo en la columna que importa.
 */
export function signupsToCsv(signups: SignalSignup[]): string {
  const header = [
    "nombre",
    "email",
    "idioma",
    "novedades",
    "aviso_aceptado",
    "fecha_registro",
  ].join(",");

  const rows = signups.map((signup) =>
    [
      signup.name,
      signup.email,
      signup.locale,
      signup.marketingOptIn ? "si" : "no",
      signup.privacyVersion,
      new Date(signup.createdAt).toISOString(),
    ]
      .map(csvCell)
      .join(","),
  );

  return `﻿${[header, ...rows].join("\n")}`;
}
