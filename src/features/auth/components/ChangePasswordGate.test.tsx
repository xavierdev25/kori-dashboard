import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChangePasswordGate } from "@/features/auth/components/ChangePasswordGate";

const sesion = {
  isAdmin: true,
  isAuthenticated: true,
  isChecking: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  status: "authenticated" as const,
  user: null as null | {
    email: string;
    id: string;
    mustChangePassword: boolean;
    role: "ADMIN" | "ARTIST";
  },
};

vi.mock("@/features/auth/context/AuthContext", () => ({
  useSession: () => sesion,
}));

const cambiar = vi.fn();

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    changePassword: (...args: unknown[]) => cambiar(...args) as unknown,
  },
}));

afterEach(() => {
  cleanup();
  cambiar.mockReset();
  sesion.refreshUser.mockReset();
});

const USUARIO = {
  email: "guillermo@ejemplo.com",
  id: "u1",
  role: "ADMIN" as const,
};

describe("ChangePasswordGate", () => {
  it("deja pasar a quien ya eligio su contrasena", () => {
    sesion.user = { ...USUARIO, mustChangePassword: false };

    render(
      <ChangePasswordGate>
        <p>el panel</p>
      </ChangePasswordGate>,
    );

    expect(screen.getByText("el panel")).toBeDefined();
    expect(screen.queryByText("Elige tu contrasena")).toBeNull();
  });

  it("tapa el panel mientras la contrasena sea la de reparto", () => {
    // Es una barrera, no un aviso: mientras la cuenta se abra con lo que le
    // paso otra persona por un mensaje, no esta en manos de su dueno.
    sesion.user = { ...USUARIO, mustChangePassword: true };

    render(
      <ChangePasswordGate>
        <p>el panel</p>
      </ChangePasswordGate>,
    );

    expect(screen.getByText("Elige tu contrasena")).toBeDefined();
    expect(screen.queryByText("el panel")).toBeNull();
  });

  it("no ofrece ninguna forma de posponerlo", () => {
    // Un recordatorio que se puede posponer se pospone para siempre.
    sesion.user = { ...USUARIO, mustChangePassword: true };

    render(
      <ChangePasswordGate>
        <p>el panel</p>
      </ChangePasswordGate>,
    );

    const botones = screen.getAllByRole("button").map((b) => b.textContent);

    expect(botones).toEqual(["Guardar y entrar"]);
  });

  it("al terminar relee la sesion en vez de recargar", async () => {
    // Releer es lo que hace que la barrera desaparezca sola sin sacar a nadie
    // de donde estaba.
    sesion.user = { ...USUARIO, mustChangePassword: true };
    cambiar.mockResolvedValue(undefined);

    const { container } = render(
      <ChangePasswordGate>
        <p>el panel</p>
      </ChangePasswordGate>,
    );

    const campos = container.querySelectorAll("input");
    const form = container.querySelector("form")!;

    for (const campo of campos) {
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(campo, "una-frase-larga-de-verdad");
      campo.dispatchEvent(new Event("input", { bubbles: true }));
    }

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await waitFor(() => expect(cambiar).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(sesion.refreshUser).toHaveBeenCalledTimes(1));
  });

  it("no llama al servidor si las dos contrasenas no coinciden", async () => {
    sesion.user = { ...USUARIO, mustChangePassword: true };

    const { container } = render(
      <ChangePasswordGate>
        <p>el panel</p>
      </ChangePasswordGate>,
    );

    const campos = [...container.querySelectorAll("input")];
    const escribir = (campo: HTMLInputElement, valor: string) => {
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(campo, valor);
      campo.dispatchEvent(new Event("input", { bubbles: true }));
    };

    escribir(campos[0], "la-de-reparto");
    escribir(campos[1], "una-frase-larga-de-verdad");
    escribir(campos[2], "otra-frase-distinta-aqui");

    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("no coinciden"),
    );
    expect(cambiar).not.toHaveBeenCalled();
  });
});
