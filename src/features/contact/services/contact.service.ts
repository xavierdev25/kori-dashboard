import { apiRequest } from "@/shared/lib/api-client";
import type { PaginatedContactResponse } from "@/features/contact/types/contact.types";

export const contactService = {
  getMessages(page = 1, limit = 20, signal?: AbortSignal) {
    return apiRequest<PaginatedContactResponse>(
      `/admin/contact?page=${page}&limit=${limit}`,
      { signal },
    );
  },

  deleteMessage(id: string) {
    return apiRequest<{ deleted: boolean; id: string }>(`/admin/contact/${id}`, {
      method: "DELETE",
    });
  },
};
