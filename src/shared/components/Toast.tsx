"use client";

import { AlertTriangle, Check, X } from "@/shared/components/icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cue } from "@/shared/lib/sound";
import { cn } from "@/shared/utils/cn";

type ToastTone = "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  error: (message: string) => void;
  success: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Los errores se quedan mas tiempo: hay que leerlos, no solo verlos pasar. */
const DURATION_MS: Record<ToastTone, number> = {
  error: 8000,
  success: 4000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message: string, tone: ToastTone) => {
    // Date.now() puede repetirse en el mismo milisegundo; el random evita
    // que dos avisos casi simultaneos compartan key y React se confunda.
    const id = Date.now() + Math.random();

    // El aviso suena por lo que es, no por donde ocurrio: un unico sitio
    // cubre guardar, publicar, borrar y todo lo que venga despues.
    cue(tone === "success" ? "success" : "error");
    setToasts((current) => [...current, { id, message, tone }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      error: (message) => push(message, "error"),
      success: (message) => push(message, "success"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* aria-live: un lector de pantalla anuncia el aviso sin robar el foco */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} onDismiss={dismiss} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  onDismiss,
  toast,
}: {
  onDismiss: (id: number) => void;
  toast: Toast;
}) {
  useEffect(() => {
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      DURATION_MS[toast.tone],
    );

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id, toast.tone]);

  const Icon = toast.tone === "success" ? Check : AlertTriangle;

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
        "motion-safe:animate-[toast-in_180ms_ease-out]",
        toast.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-rose-200 bg-rose-50 text-rose-900",
      )}
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1 leading-5">{toast.message}</span>
      <button
        aria-label="Cerrar aviso"
        className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Devuelve una API que no rompe si falta el provider: en ese caso los avisos
 * se pierden en silencio en vez de tumbar la pantalla. Un toast nunca deberia
 * ser el motivo de que algo deje de funcionar.
 */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  return (
    context ?? {
      error: () => undefined,
      success: () => undefined,
    }
  );
}
