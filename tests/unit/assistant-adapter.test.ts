import { afterEach, describe, expect, it, vi } from "vitest";

import { createAssistantAdapter } from "../../src/lib/assistant/adapter";
import { HttpAssistantAdapter } from "../../src/lib/assistant/http-adapter";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("assistant adapters", () => {
  it("stays disabled without a base URL and makes no request", async () => {
    const fetchImpl = vi.fn();
    const adapter = createAssistantAdapter(null, { fetchImpl });
    expect(adapter.kind).toBe("disabled");
    await expect(adapter.health()).resolves.toMatchObject({
      ok: false,
      error: { code: "not-configured" },
    });
    await expect(adapter.queryPublic({ query: "hello" })).resolves.toMatchObject({
      ok: false,
      error: { code: "not-configured" },
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("accepts healthy and public-query responses", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok", version: "1.0" })),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            answer: "Public answer",
            sources: [{ id: "about", title: "About Me" }],
          }),
        ),
      );
    const adapter = new HttpAssistantAdapter({
      baseUrl: "https://assistant.example/",
      fetchImpl,
    });
    await expect(adapter.health()).resolves.toEqual({
      ok: true,
      data: { status: "ok", version: "1.0" },
    });
    await expect(adapter.queryPublic({ query: "Who?" })).resolves.toMatchObject({
      ok: true,
      data: { answer: "Public answer" },
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://assistant.example/v1/health",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("normalizes invalid JSON and HTTP errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("not-json"))
      .mockResolvedValueOnce(new Response("busy", { status: 503 }));
    const adapter = new HttpAssistantAdapter({
      baseUrl: "https://assistant.example",
      fetchImpl,
    });
    await expect(adapter.health()).resolves.toMatchObject({
      ok: false,
      error: { code: "invalid-response" },
    });
    await expect(adapter.health()).resolves.toMatchObject({
      ok: false,
      error: { code: "http-error", status: 503, retryable: true },
    });
  });

  it("aborts and reports the eight-second timeout", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    const adapter = new HttpAssistantAdapter({
      baseUrl: "https://assistant.example",
      fetchImpl: fetchImpl as typeof fetch,
    });
    const result = adapter.health();
    await vi.advanceTimersByTimeAsync(8_000);
    await expect(result).resolves.toMatchObject({
      ok: false,
      error: { code: "timeout", retryable: true },
    });
  });
});
