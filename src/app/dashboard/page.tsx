"use client";

import Link from "next/link";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { StatsCards } from "@/features/notes/components/StatsCards";
import { useNotesStats } from "@/features/notes/hooks/useNotes";
import { Button, buttonVariants } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Spinner } from "@/shared/components/Spinner";

export default function DashboardPage() {
  const { error, loading, refresh, stats } = useNotesStats();

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Resumen</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Estado general de notas recibidas desde la landing.
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "primary" })}
          href="/dashboard/notes"
        >
          <span>Ver notas</span>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-neutral-200 bg-white">
          <Spinner label="Cargando metricas" />
        </div>
      ) : error ? (
        <EmptyState
          action={
            <Button
              leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
              onClick={refresh}
              variant="secondary"
            >
              Reintentar
            </Button>
          }
          description={error}
          title="No se pudieron cargar las metricas"
        />
      ) : stats ? (
        <StatsCards stats={stats} />
      ) : null}
    </section>
  );
}
