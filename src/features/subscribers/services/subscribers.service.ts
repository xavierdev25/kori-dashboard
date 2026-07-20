import { apiRequest } from "@/shared/lib/api-client";
import type {
  PaginatedSubscribersResponse,
  Subscriber,
} from "@/features/subscribers/types/subscriber.types";

export const subscribersService = {
  deleteSubscriber(id: string) {
    return apiRequest<{ deleted: boolean; id: string }>(
      `/admin/subscribers/${id}`,
      { method: "DELETE" },
    );
  },

  getSubscribers(page = 1, limit = 20) {
    return apiRequest<PaginatedSubscribersResponse>(
      `/admin/subscribers?page=${page}&limit=${limit}`,
    );
  },

  /** Trae todas las páginas (para exportar CSV). */
  async getAllSubscribers(): Promise<Subscriber[]> {
    const all: Subscriber[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.getSubscribers(page, 100);
      all.push(...response.data);
      totalPages = response.meta.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all;
  },
};

export function subscribersToCsv(subscribers: Subscriber[]): string {
  const header = "email,fecha_registro";
  const rows = subscribers.map(
    (subscriber) =>
      `${subscriber.email},${new Date(subscriber.createdAt).toISOString()}`,
  );
  return [header, ...rows].join("\n");
}
