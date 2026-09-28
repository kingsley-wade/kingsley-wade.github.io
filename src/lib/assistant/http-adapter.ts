import type {
  AssistantAdapter,
  AssistantHealth,
  AssistantResult,
  PublicQueryInput,
  PublicQueryResponse,
} from "./contracts";

type FetchLike = typeof fetch;

export type HttpAssistantAdapterOptions = {
  baseUrl: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

const isHealth = (value: unknown): value is AssistantHealth => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AssistantHealth>;
  return candidate.status === "ok" && typeof candidate.version === "string";
};

const isPublicQueryResponse = (value: unknown): value is PublicQueryResponse => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PublicQueryResponse>;
  return (
    typeof candidate.answer === "string" &&
    Array.isArray(candidate.sources) &&
    candidate.sources.every(
      (source) =>
        source &&
        typeof source === "object" &&
        typeof source.id === "string" &&
        typeof source.title === "string" &&
        (source.url === undefined || typeof source.url === "string"),
    )
  );
};

export class HttpAssistantAdapter implements AssistantAdapter {
  readonly kind = "http" as const;
  readonly #baseUrl: string;
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;

  constructor(options: HttpAssistantAdapterOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.#fetch = options.fetchImpl ?? fetch;
    this.#timeoutMs = options.timeoutMs ?? 8_000;
  }

  health(signal?: AbortSignal): Promise<AssistantResult<AssistantHealth>> {
    return this.#request("/v1/health", { method: "GET" }, isHealth, signal);
  }

  queryPublic(
    input: PublicQueryInput,
    signal?: AbortSignal,
  ): Promise<AssistantResult<PublicQueryResponse>> {
    return this.#request(
      "/v1/public/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      isPublicQueryResponse,
      signal,
    );
  }

  async #request<T>(
    path: string,
    init: RequestInit,
    validate: (value: unknown) => value is T,
    externalSignal?: AbortSignal,
  ): Promise<AssistantResult<T>> {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.#timeoutMs);
    const abortFromCaller = () => controller.abort();
    externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      const response = await this.#fetch(`${this.#baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
      if (!response.ok) {
        return {
          ok: false,
          error: {
            code: "http-error",
            message: `Assistant request failed with HTTP ${response.status}`,
            retryable: response.status >= 500 || response.status === 429,
            status: response.status,
          },
        };
      }
      let value: unknown;
      try {
        value = await response.json();
      } catch {
        return {
          ok: false,
          error: {
            code: "invalid-response",
            message: "Assistant returned invalid JSON",
            retryable: false,
          },
        };
      }
      if (!validate(value)) {
        return {
          ok: false,
          error: {
            code: "invalid-response",
            message: "Assistant response does not match the public contract",
            retryable: false,
          },
        };
      }
      return { ok: true, data: value };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: timedOut ? "timeout" : "network-error",
          message: timedOut
            ? `Assistant request timed out after ${this.#timeoutMs}ms`
            : error instanceof Error
              ? error.message
              : "Assistant network request failed",
          retryable: true,
        },
      };
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abortFromCaller);
    }
  }
}
