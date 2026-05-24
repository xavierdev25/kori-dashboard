import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("rounded-lg border border-neutral-200 bg-white shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
