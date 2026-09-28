import type { AssistantAdapter } from "./contracts";
import { DisabledAssistantAdapter } from "./disabled-adapter";
import { HttpAssistantAdapter, type HttpAssistantAdapterOptions } from "./http-adapter";

export const createAssistantAdapter = (
  baseUrl: string | null,
  options: Omit<HttpAssistantAdapterOptions, "baseUrl"> = {},
): AssistantAdapter =>
  baseUrl
    ? new HttpAssistantAdapter({ baseUrl, ...options })
    : new DisabledAssistantAdapter();
