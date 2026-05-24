export type NoteType = "TEXT" | "DRAWING";

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
  totalText: number;
}

export type NotesFilterType = "ALL" | NoteType;

export interface NotesQuery {
  limit?: number;
  page?: number;
  search?: string;
  type?: NoteType;
}
