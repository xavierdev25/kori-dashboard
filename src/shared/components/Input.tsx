import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  /** Aclaración bajo el campo. Desaparece si hay error: manda el error. */
  hint?: string;
  label?: string;
};

export function Input({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-neutral-800" htmlFor={inputId}>
      {label ? <span>{label}</span> : null}
      <input
        className={cn(
          "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:bg-neutral-100",
          error && "border-red-500 focus:border-red-600 focus:ring-red-500/10",
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-red-700">{error}</span>
      ) : hint ? (
        <span className="text-xs font-normal text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
}
