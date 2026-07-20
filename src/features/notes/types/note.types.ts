export type NoteType = "TEXT" | "DRAWING";

export type NoteStatus = "PENDING" | "APPROVED";

export interface AdminNote {
  color: "yellow" | "pink" | "blue" | "green" | null;
  createdAt: string;
  id: string;
  imageUrl: string | null;
  message: string | null;
  positionX: number;
  positionY: number;
  recipientName: string;
  rotation: number;
  status: NoteStatus;
  storagePath: string | null;
  type: NoteType;
  zIndex: number;
}

export interface PaginatedNotesResponse {
  data: AdminNote[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

export interface NotesStats {
  total: number;
  totalDrawing: number;
  totalPending: number;
  totalText: number;
}

export type NotesFilterType = "ALL" | NoteType;

export type NotesFilterStatus = "ALL" | NoteStatus;

export interface NotesQuery {
  limit?: number;
  page?: number;
  search?: string;
  status?: NoteStatus;
  type?: NoteType;
}
