import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type BadgeTone = "neutral" | "blue" | "green" | "pink";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-neutral-300 bg-neutral-100 text-neutral-700",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pink: "border-rose-200 bg-rose-50 text-rose-800",
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
