export interface Subscriber {
  createdAt: string;
  email: string;
  id: string;
}

export interface PaginatedSubscribersResponse {
  data: Subscriber[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}
