import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RowMenu, RowMenuItem } from "@/shared/components/RowMenu";

afterEach(cleanup);

/**
 * Se usa `fireEvent` y no `user-event`: ese paquete no esta instalado y no
 * compensa traerlo por estas pruebas. Donde importa la diferencia —el cierre
 * al pulsar fuera— se lanza `pointerDown` a mano, que es el evento que el
 * componente escucha de verdad.
 */
function montar(alElegir = vi.fn()) {
  const vista = render(
    <RowMenu label="Acciones de Playera Kori">
      <RowMenuItem onSelect={alElegir} tone="danger">
        Borrar producto
      </RowMenuItem>
      <RowMenuItem onSelect={vi.fn()}>Duplicar</RowMenuItem>
    </RowMenu>,
  );

  return {
    alElegir,
    disparador: screen.getByRole("button", {
      name: "Acciones de Playera Kori",
    }),
    unmount: vista.unmount,
  };
}

describe("RowMenu", () => {
  it("arranca cerrado", () => {
    const { disparador } = montar();

    expect(screen.queryByRole("menu")).toBeNull();
    expect(disparador.getAttribute("aria-expanded")).toBe("false");
  });

  it("abre y deja el foco en la primera opcion", () => {
    const { disparador } = montar();

    fireEvent.click(disparador);

    expect(screen.getByRole("menu")).toBeTruthy();
    expect(disparador.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toBe("Borrar producto");
  });

  it("elegir una opcion la ejecuta y cierra el menu", () => {
    const { alElegir, disparador } = montar();

    fireEvent.click(disparador);
    fireEvent.click(screen.getByRole("menuitem", { name: /borrar/i }));

    expect(alElegir).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Escape cierra y devuelve el foco al boton", () => {
    // Quien abre con el teclado y se arrepiente tiene que volver a donde
    // estaba; si no, el foco cae al principio de la pagina.
    const { disparador } = montar();

    fireEvent.click(disparador);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(disparador);
  });

  it("las flechas recorren las opciones y dan la vuelta", () => {
    const { disparador } = montar();

    fireEvent.click(disparador);

    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("Duplicar");

    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("Borrar producto");

    fireEvent.keyDown(document, { key: "ArrowUp" });
    expect(document.activeElement?.textContent).toBe("Duplicar");
  });

  it("pulsar fuera cierra el menu", () => {
    const { disparador } = montar();

    fireEvent.click(disparador);
    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("pulsar dentro del menu no lo cierra", () => {
    // El mismo oyente que cierra al pulsar fuera no debe dispararse con un
    // clic en el borde del propio menu.
    const { disparador } = montar();

    fireEvent.click(disparador);
    fireEvent.pointerDown(screen.getByRole("menu"));

    expect(screen.queryByRole("menu")).toBeTruthy();
  });

  it("al desmontarse abierto retira todos sus oyentes", () => {
    // La fila desaparece con el menu abierto justo al borrar. Sin retirar los
    // oyentes, cada apertura acumula uno mas apuntando a un cierre muerto.
    const quitarDocumento = vi.spyOn(document, "removeEventListener");
    const quitarVentana = vi.spyOn(window, "removeEventListener");

    const { disparador, unmount } = montar();

    fireEvent.click(disparador);
    unmount();

    const retirados = [
      ...quitarDocumento.mock.calls.map(([tipo]) => tipo),
      ...quitarVentana.mock.calls.map(([tipo]) => tipo),
    ];

    expect(retirados).toContain("pointerdown");
    expect(retirados).toContain("keydown");
    expect(retirados).toContain("scroll");
    expect(retirados).toContain("resize");

    quitarDocumento.mockRestore();
    quitarVentana.mockRestore();
  });
});
