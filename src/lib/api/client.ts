/**
 * Client-side fetch helper. Use this from "use client" components instead of
 * raw fetch() — handles credentials, JSON encoding, and unwraps the standard
 * { error: { message, code, details } } error envelope into typed exceptions.
 */

export class ApiClientError extends Error {
  status: number;
  code: string | null;
  details: unknown;

  constructor(
    status: number,
    message: string,
    code: string | null,
    details: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Request failed";
  const p = payload as {
    error?: { message?: string; details?: { errors?: { message?: string }[] } };
    message?: string;
  };
  if (p.error?.message) return p.error.message;
  const issues = p.error?.details?.errors;
  if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
  if (typeof p.message === "string") return p.message;
  return "Request failed";
}

function extractErrorCode(payload: unknown): string | null {
  const p = payload as { error?: { code?: string } } | undefined;
  return p?.error?.code ?? null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const init: RequestInit = {
    credentials: "include",
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  const response = await fetch(path, init);

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      extractErrorMessage(payload),
      extractErrorCode(payload),
      payload,
    );
  }

  return payload as T;
}
