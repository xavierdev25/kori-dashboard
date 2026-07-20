import { Clock, FileText, Images, StickyNote } from "lucide-react";
import type { NotesStats } from "@/features/notes/types/note.types";
import { Card } from "@/shared/components/Card";

const statItems = [
  {
    icon: StickyNote,
    key: "total",
    label: "Total de notas",
  },
  {
    icon: FileText,
    key: "totalText",
    label: "Notas de texto",
  },
  {
    icon: Images,
    key: "totalDrawing",
    label: "Notas de dibujo",
  },
  {
    icon: Clock,
    key: "totalPending",
    label: "Pendientes de revision",
  },
] as const;

export function StatsCards({ stats }: { stats: NotesStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card className="p-5" key={item.key}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
                  {stats[item.key]}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
