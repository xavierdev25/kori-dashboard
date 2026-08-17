"use client";

import { ChevronLeft, ChevronRight, RefreshCcw, Trash2 } from "@/shared/components/icons";
import { Suspense, useCallback, useState } from "react";
import { contactService } from "@/features/contact/services/contact.service";
import type {
  ContactMessage,
  PaginatedContactResponse,
} from "@/features/contact/types/contact.types";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState";
import { TableSkeleton } from "@/shared/components/Skeleton";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useQueryParams } from "@/shared/hooks/useQueryParams";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const NO_MESSAGES: PaginatedContactResponse = {
  data: [],
  meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
};

const MESSAGES_DEFAULTS = { page: "1" };

export default function MessagesPage() {
  return (
    // Obligatorio: sin este limite el build de produccion falla al
    // prerenderizar una pagina estatica que lee la URL.
    <Suspense fallback={<TableSkeleton />}>
      <MessagesView />
    </Suspense>
  );
}

function MessagesView() {
  const [params, setParams] = useQueryParams(MESSAGES_DEFAULTS);
  const page = Number(params.page) || 1;
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadPage = useCallback(
    (signal: AbortSignal) => contactService.getMessages(page, 20, signal),
    [page],
  );

  const {
    data,
    error,
    loading,
    refresh,
  } = useAsyncData(loadPage, {
    fallbackMessage: "No se pudieron cargar los mensajes.",
    initialData: NO_MESSAGES,
  });

  const meta = data.meta;
  const messages = data.data;

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await contactService.deleteMessage(deleteTarget.id);
      toast.success("Mensaje borrado.");
      setDeleteTarget(null);
      await refresh();
    } catch (deleteError) {
      toast.error(getErrorText(deleteError, "No se pudo borrar el mensaje."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Mensajes
            {meta.total > 0 ? (
              <span className="ml-2 align-middle text-base font-normal text-neutral-500">
                {meta.total}
              </span>
            ) : null}
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Lo que llega por el formulario de GKY. Cada uno tambien te llego al
            correo: responde ahi y le contestas directo a quien escribio.
          </p>
        </div>
        <Button
          disabled={loading}
          leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
          onClick={refresh}
          variant="secondary"
        >
          Actualizar
        </Button>
      </div>

      {loading ? (
        <TableSkeleton columns={2} rows={5} />
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
          title="No se pudo cargar la bandeja"
        />
      ) : messages.length === 0 ? (
        <EmptyState
          description="Cuando alguien escriba desde GKY aparecera aqui."
          title="Sin mensajes"
        />
      ) : (
        <ul className="grid gap-3">
          {messages.map((message) => (
            <li
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              key={message.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-950">{message.name}</p>
                  {/* El correo como enlace: contestar es la accion principal de
                      esta pantalla, y `mailto:` abre el cliente con el
                      destinatario ya puesto. */}
                  <a
                    className="text-sm break-all text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                    href={`mailto:${message.email}`}
                  >
                    {message.email}
                  </a>
                  <p className="mt-1 text-xs text-neutral-500">
                    {dateFormatter.format(new Date(message.createdAt))} ·{" "}
                    {message.locale}
                  </p>
                </div>

                {/* En gris y no en rojo solido: repetido en cada fila, el rojo
                    deja de significar "cuidado" y solo hace ruido. */}
                <Button
                  aria-label={`Borrar el mensaje de ${message.name}`}
                  leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                  onClick={() => setDeleteTarget(message)}
                  size="sm"
                  variant="ghost"
                >
                  Borrar
                </Button>
              </div>

              {/* `whitespace-pre-wrap`: viene tal cual lo escribieron, con sus
                  saltos de linea. Aplastarlo a un parrafo cambia el mensaje. */}
              <p className="mt-3 border-t border-neutral-100 pt-3 text-sm leading-6 whitespace-pre-wrap text-neutral-800">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}

      {meta.totalPages > 1 && !loading && !error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Pagina {meta.page} de {meta.totalPages} · {meta.total} mensajes
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              leftIcon={<ChevronLeft aria-hidden className="h-4 w-4" />}
              onClick={() => setParams({ page: String(page - 1) })}
              size="sm"
              variant="secondary"
            >
              Anterior
            </Button>
            <Button
              disabled={page >= meta.totalPages}
              onClick={() => setParams({ page: String(page + 1) })}
              rightIcon={<ChevronRight aria-hidden className="h-4 w-4" />}
              size="sm"
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Borrar"
        description="Se quita de la bandeja. El correo que te llego sigue en tu buzon, asi que el mensaje no se pierde."
        detail={deleteTarget ? `${deleteTarget.name} · ${deleteTarget.email}` : undefined}
        isBusy={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={deleteTarget !== null}
        title="Borrar mensaje"
      />
    </section>
  );
}
