import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { cn } from "@/shared/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  /** React 19 pasa `ref` como una prop mas: no hace falta forwardRef. */
  ref?: Ref<HTMLButtonElement>;
  rightIcon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-55";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:outline-neutral-950",
  secondary:
    "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-neutral-700",
  ghost:
    "border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-700",
  danger:
    "border-red-700 bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function buttonVariants({
  className,
  size = "md",
  variant = "primary",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function Button({
  children,
  className,
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ className, size, variant })}
      // Pulsar y soltar suenan por separado: eso es lo que convierte un clic
      // en algo con tacto. Cadena vacia = el cue por defecto del paquete.
      // Van antes del spread para que una llamada concreta pueda cambiarlos.
      //
      // El boton rojo susurra en vez de chascar: lo que hay detras no se
      // deshace, y un sonido mas apagado se lee como "ojo con esto".
      data-cuelume-press={variant === "danger" ? "whisper" : ""}
      data-cuelume-release={variant === "danger" ? "whisper" : ""}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {/* El orbe de 20 es el preset pequeno del paquete: pintado a su tamano
          exacto, que es donde esta afinado. Escalarlo lo emborrona. */}
      {isLoading ? <ThinkingOrb aria-hidden size={20} theme="auto" /> : leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}
