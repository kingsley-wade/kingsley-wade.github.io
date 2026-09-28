export type AssistantErrorCode =
  | "not-configured"
  | "timeout"
  | "network-error"
  | "http-error"
  | "invalid-response"
  | "unauthorized"
  | "forbidden"
  | "validation-error";

export type AssistantError = {
  code: AssistantErrorCode;
  message: string;
  retryable: boolean;
  status?: number;
};

export type AssistantResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AssistantError };

export type AssistantHealth = {
  status: "ok";
  version: string;
};

export type PublicQueryInput = {
  query: string;
};

export type PublicQuerySource = {
  id: string;
  title: string;
  url?: string;
};

export type PublicQueryResponse = {
  answer: string;
  sources: PublicQuerySource[];
};

export interface AssistantAdapter {
  readonly kind: "disabled" | "http";
  health(signal?: AbortSignal): Promise<AssistantResult<AssistantHealth>>;
  queryPublic(
    input: PublicQueryInput,
    signal?: AbortSignal,
  ): Promise<AssistantResult<PublicQueryResponse>>;
}

export type NoteId = string;

export type NoteSummary = {
  id: NoteId;
  title: string;
  excerpt: string;
  updatedAt: string;
  archived: boolean;
};

export type NoteRecord = NoteSummary & {
  body: string;
  tags: string[];
  createdAt: string;
};

export type NoteInput = {
  title: string;
  body: string;
  tags?: string[];
};

export const ownerScopes = [
  "notes:read",
  "notes:write",
  "notes:archive",
] as const;
export type OwnerScope = (typeof ownerScopes)[number];

export type NotesSearchResponse = {
  items: NoteSummary[];
  nextCursor: string | null;
};

export type NotesSummaryResponse = {
  summary: string;
  noteIds: NoteId[];
};

export type ApiSuccess<T> = {
  data: T;
  requestId: string;
};

export type ApiErrorResponse = {
  error: {
    code: "unauthorized" | "forbidden" | "validation-error" | "timeout";
    message: string;
    requestId: string;
    details?: Record<string, string[]>;
  };
};

export type NotesAuditEvent = {
  requestId: string;
  ownerSubject: string;
  action: "search" | "create" | "update" | "archive" | "summarize";
  noteIds: NoteId[];
  occurredAt: string;
  outcome: "allowed" | "denied" | "failed";
};

export interface OwnerNotesAdapter {
  searchNotes(
    query: string,
    signal?: AbortSignal,
  ): Promise<AssistantResult<NotesSearchResponse>>;
  createNote(
    input: NoteInput,
    signal?: AbortSignal,
  ): Promise<AssistantResult<NoteRecord>>;
  updateNote(
    id: NoteId,
    input: Partial<NoteInput>,
    signal?: AbortSignal,
  ): Promise<AssistantResult<NoteRecord>>;
  archiveNote(
    id: NoteId,
    signal?: AbortSignal,
  ): Promise<AssistantResult<{ archived: true }>>;
  summarizeNotes(
    ids: NoteId[],
    signal?: AbortSignal,
  ): Promise<AssistantResult<NotesSummaryResponse>>;
}
