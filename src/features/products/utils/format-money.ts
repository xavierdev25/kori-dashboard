/**
 * Los precios viajan y se guardan en centavos enteros. Esta es la unica
 * frontera donde se convierten a pesos, y solo para mostrarlos.
 */
export function formatMoney(cents: number, currency = "MXN") {
  return `$${(cents / 100).toLocaleString("es-MX", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * Convierte lo que el usuario escribe ("599", "599.50", "1,199") a centavos.
 * Devuelve null si no es un importe valido, para que el formulario avise en
 * vez de mandar un NaN al servidor.
 */
export function parseMoneyToCents(value: string): number | null {
  const trimmed = value.replace(/[\s$]/g, "");

  // Las comas solo valen como separador de miles y en su sitio. Quitarlas sin
  // mirar convertiria un "5,5,5" mal tecleado en 555 pesos sin avisar.
  const isPlain = /^\d+(\.\d{1,2})?$/.test(trimmed);
  const hasValidThousands = /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(trimmed);

  if (!isPlain && !hasValidThousands) {
    return null;
  }

  const normalized = trimmed.replace(/,/g, "");

  // Se redondea porque 599.99 * 100 da 59998.99999... en coma flotante.
  const cents = Math.round(Number(normalized) * 100);

  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

/** Centavos a texto editable en un input: 59900 → "599.00". */
export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2);
}
