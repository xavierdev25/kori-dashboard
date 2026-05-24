"use client";

import { FormEvent, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import type { NotesFilterType } from "@/features/notes/types/note.types";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export interface NotesFiltersValue {
  limit: number;
  search: string;
  type: NotesFilterType;
}

export function NotesFilters({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean;
  onChange: (value: NotesFiltersValue) => void;
  value: NotesFiltersValue;
}) {
  const [search, setSearch] = useState(value.search);
  const [type, setType] = useState<NotesFilterType>(value.type);
  const [limit, setLimit] = useState(value.limit);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ limit, search: search.trim(), type });
  }

  function handleReset() {
    const nextValue = { limit: 20, search: "", type: "ALL" as const };
    setSearch(nextValue.search);
    setType(nextValue.type);
    setLimit(nextValue.limit);
    onChange(nextValue);
  }

  return (
    <form
      className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_140px_auto_auto]"
      onSubmit={handleSubmit}
    >
      <Input
        disabled={disabled}
        label="Buscar"
        name="search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Destinatario o mensaje"
        value={search}
      />

      <label className="grid gap-2 text-sm font-medium text-neutral-800">
        <span>Tipo</span>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:bg-neutral-100"
          disabled={disabled}
          onChange={(event) => setType(event.target.value as NotesFilterType)}
          value={type}
        >
          <option value="ALL">Todos</option>
          <option value="TEXT">Texto</option>
          <option value="DRAWING">Dibujo</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-neutral-800">
        <span>Por pagina</span>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:bg-neutral-100"
          disabled={disabled}
          onChange={(event) => setLimit(Number(event.target.value))}
          value={limit}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>

      <Button
        className="self-end"
        disabled={disabled}
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        type="submit"
      >
        Filtrar
      </Button>
      <Button
        className="self-end"
        disabled={disabled}
        leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />}
        onClick={handleReset}
        variant="secondary"
      >
        Limpiar
      </Button>
    </form>
  );
}
