import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductForm, slugify } from "@/features/products/components/ProductForm";

afterEach(cleanup);

const opcion = (nombre: RegExp) =>
  screen.getByRole("radio", { name: nombre }) as HTMLInputElement;

describe("ProductForm", () => {
  describe("que se puede vender", () => {
    it("el drumkit se puede elegir y viene marcado de salida", () => {
      render(<ProductForm onSubmit={vi.fn()} showKind />);

      const digital = opcion(/drumkit o preset/i);

      expect(digital.disabled).toBe(false);
      expect(digital.checked).toBe(true);
    });

    it("el merch esta apagado", () => {
      // Apagado de verdad, no solo en gris: un `disabled` real impide
      // elegirlo con el teclado y lo saca del recorrido de tabulacion.
      render(<ProductForm onSubmit={vi.fn()} showKind />);

      expect(opcion(/merch/i).disabled).toBe(true);
    });

    it("dice que todavia no, y por que", () => {
      // Una opcion en gris sin explicacion parece un fallo de la pagina.
      render(<ProductForm onSubmit={vi.fn()} showKind />);

      expect(screen.getByText("Todavia no")).toBeTruthy();
      expect(screen.getByText(/falta dar de alta el proveedor/i)).toBeTruthy();
    });

    // NO hay prueba de "pulsar el merch no hace nada", y es deliberado.
    //
    // Con `fireEvent` no se puede escribir de forma honesta: despacha el clic
    // a pelo, saltandose la comprobacion de `disabled` que si hace un
    // navegador, y ademas React convierte ese clic en un `change` para radios
    // y casillas. Resultado: en jsdom el estado SI cambia, cuando en un
    // navegador no llega a producirse ningun evento. Una prueba escrita ahi
    // estaria midiendo una situacion que no existe.
    //
    // Lo que se comprueba arriba —que el `disabled` esta puesto— es la
    // garantia de verdad, y quien la aplica es el navegador. Con
    // `@testing-library/user-event`, que respeta `disabled`, esto si se podria
    // probar; no esta instalado y no compensa traerlo solo por esto.

    it("un producto digital se envia como DIGITAL", async () => {
      // Lo que de verdad importa: que con el merch apagado no haya forma de
      // que salga un POD_APPAREL de aqui.
      const enviar = vi.fn().mockResolvedValue(undefined);
      render(<ProductForm onSubmit={enviar} showKind />);

      fireEvent.change(screen.getByLabelText(/nombre/i), {
        target: { value: "Drumkit Diciembre" },
      });
      fireEvent.change(screen.getByLabelText(/precio/i), {
        target: { value: "20" },
      });
      fireEvent.submit(screen.getByRole("button", { name: /guardar/i }));

      await vi.waitFor(() => expect(enviar).toHaveBeenCalled());

      const enviado = enviar.mock.calls[0]?.[0] as {
        fulfillmentType: string;
        priceCents: number;
        type: string;
      };

      expect(enviado.type).toBe("DIGITAL");
      expect(enviado.fulfillmentType).toBe("DIGITAL");
      // En centavos enteros: el resto del sistema no ve decimales.
      expect(enviado.priceCents).toBe(2000);
    });
  });

  describe("los ejemplos acompañan a lo elegido", () => {
    it("con drumkit no propone una playera", () => {
      // Estaban fijos en merch, asi que al crear un drumkit el formulario
      // sugeria llamarlo "Playera Kori".
      render(<ProductForm onSubmit={vi.fn()} showKind />);

      expect(
        screen.getByPlaceholderText("Drumkit Diciembre"),
      ).toBeTruthy();
      expect(screen.queryByPlaceholderText("Playera Kori")).toBeNull();
    });
  });

  describe("slugify", () => {
    it("quita acentos para no romper el patron de la URL", () => {
      expect(slugify("Camiseta Otoño")).toBe("camiseta-otono");
    });

    it("colapsa separadores y no deja guiones sueltos en los bordes", () => {
      expect(slugify("  Drumkit   Diciembre!! ")).toBe("drumkit-diciembre");
    });
  });
});
