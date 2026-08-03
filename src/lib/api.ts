import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import type { DuplicateLeadMatch, TokenResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export class ApiConflictError extends ApiError {
  constructor(
    message: string,
    public duplicates: DuplicateLeadMatch[],
  ) {
    super(message, 409);
  }
}

type ValidationIssue = { loc?: (string | number)[]; msg?: string };

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request could not be completed. Please check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "Some fields are invalid. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again shortly.",
  502: "The server is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

const INTERNAL_PATTERNS = [
  /traceback/i,
  /sqlalchemy/i,
  /psycopg/i,
  /asyncpg/i,
  /exception/i,
  /stack/i,
  /file ".*"/i,
  /line \d+/i,
  /set [A-Z_]+=/i,
  /run:\s*python/i,
  /\.py\b/i,
  /postgresql/i,
];

function isSafeUserMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 240) return false;
  if (INTERNAL_PATTERNS.some((re) => re.test(trimmed))) return false;
  return true;
}

function formatApiError(detail: unknown, status?: number): string {
  if (typeof detail === "string") {
    if (isSafeUserMessage(detail)) return detail.trim();
    return STATUS_MESSAGES[status ?? 500] ?? STATUS_MESSAGES[500];
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item: ValidationIssue) => {
        const field = item.loc?.filter((p) => p !== "body").join(".") || "field";
        const label =
          field === "slug"
            ? "Workspace URL"
            : field === "username"
              ? "Username"
              : field === "email"
                ? "Email"
                : field === "password"
                  ? "Password"
                  : field;
        const msg = item.msg ?? "is invalid";
        return `${label}: ${msg}`;
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" · ");
  }
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  return "Something went wrong. Please try again.";
}

function networkError(): ApiError {
  return new ApiError(
    "Unable to reach the server. Please check your connection and try again.",
    0,
  );
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = (await res.json()) as TokenResponse;
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function doFetch(path: string, options: RequestInit, headers: Headers): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw networkError();
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  let token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await doFetch(path, options, headers);

  if (res.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await doFetch(path, options, headers);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    if (
      res.status === 409 &&
      detail &&
      typeof detail === "object" &&
      Array.isArray((detail as { duplicates?: unknown }).duplicates)
    ) {
      const conflict = detail as { message?: string; duplicates: DuplicateLeadMatch[] };
      throw new ApiConflictError(
        conflict.message && isSafeUserMessage(conflict.message)
          ? conflict.message
          : "A possible duplicate lead was found",
        conflict.duplicates,
      );
    }
    throw new ApiError(formatApiError(detail ?? res.statusText, res.status), res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers();
  let token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method: "POST", body: formData, headers });
  } catch {
    throw networkError();
  }
  if (res.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      try {
        res = await fetch(`${API_URL}${path}`, { method: "POST", body: formData, headers });
      } catch {
        throw networkError();
      }
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(formatApiError(err.detail ?? res.statusText, res.status), res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiBlob(path: string): Promise<Blob> {
  const headers = new Headers();
  let token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { headers });
  } catch {
    throw networkError();
  }
  if (res.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      try {
        res = await fetch(`${API_URL}${path}`, { headers });
      } catch {
        throw networkError();
      }
    }
  }
  if (!res.ok) {
    throw new ApiError("Unable to download the file. Please try again.", res.status);
  }
  return res.blob();
}

export async function apiStreamAI(
  action: string,
  body: Record<string, string>,
  onChunk: (text: string, mode: string) => void,
): Promise<{ mode: string; error?: string }> {
  const headers = new Headers({ "Content-Type": "application/json" });
  let token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const payload = JSON.stringify({ action, ...body });
  let res: Response;
  try {
    res = await fetch(`${API_URL}/ai/stream`, {
      method: "POST",
      headers,
      body: payload,
    });
  } catch {
    throw networkError();
  }

  if (res.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      try {
        res = await fetch(`${API_URL}/ai/stream`, {
          method: "POST",
          headers,
          body: payload,
        });
      } catch {
        throw networkError();
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(formatApiError(err.detail ?? res.statusText, res.status), res.status);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new ApiError("AI response is temporarily unavailable.", 500);

  const decoder = new TextDecoder();
  let buffer = "";
  let mode = "mock";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const chunkPayload = JSON.parse(line.slice(6)) as {
          chunk?: string;
          done?: boolean;
          mode?: string;
          error?: string;
        };
        if (chunkPayload.mode) mode = chunkPayload.mode;
        if (chunkPayload.error) return { mode, error: chunkPayload.error };
        if (chunkPayload.chunk) onChunk(chunkPayload.chunk, mode);
        if (chunkPayload.done) return { mode };
      } catch {
        // skip malformed SSE line
      }
    }
  }
  return { mode };
}
