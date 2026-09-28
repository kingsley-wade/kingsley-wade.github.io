import type {
  AssistantAdapter,
  AssistantHealth,
  AssistantResult,
  PublicQueryInput,
  PublicQueryResponse,
} from "./contracts";

const disabled = <T>(): AssistantResult<T> => ({
  ok: false,
  error: {
    code: "not-configured",
    message: "Assistant offline / not configured",
    retryable: false,
  },
});

export class DisabledAssistantAdapter implements AssistantAdapter {
  readonly kind = "disabled" as const;

  async health(_signal?: AbortSignal): Promise<AssistantResult<AssistantHealth>> {
    return disabled<AssistantHealth>();
  }

  async queryPublic(
    _input: PublicQueryInput,
    _signal?: AbortSignal,
  ): Promise<AssistantResult<PublicQueryResponse>> {
    return disabled<PublicQueryResponse>();
  }
}
