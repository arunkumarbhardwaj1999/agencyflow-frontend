import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import type { TokenResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type ValidationIssue = { loc?: (string | number)[]; msg?: string };

function formatApiError(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item: ValidationIssue) => {
        const field = item.loc?.filter((p) => p !== "body").join(".") || "field";
        const label = field === "slug" ? "Workspace slug" : field;
        return `${label}: ${item.msg ?? "invalid"}`;
      })
      .join(" · ");
  }
  return "Request failed";
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
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

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(formatApiError(err.detail ?? res.statusText), res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiBlob(path: string): Promise<Blob> {
  const headers = new Headers();
  let token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`${API_URL}${path}`, { headers });
  if (res.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_URL}${path}`, { headers });
    }
  }
  if (!res.ok) {
    throw new ApiError("Download failed", res.status);
  }
  return res.blob();
}
