import { Loader2 } from "lucide-react";

export function Spinner({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600">
      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
