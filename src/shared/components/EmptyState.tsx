import type { ReactNode } from "react";

export function EmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
      <div>
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-md text-sm leading-6 text-neutral-600">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
