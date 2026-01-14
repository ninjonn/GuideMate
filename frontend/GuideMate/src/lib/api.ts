// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type ApiErrorPayload = {
  message?: string | string[];
};

function resolveUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${base}/${normalizedPath}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (auth && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const res = await fetch(resolveUrl(path), {
    ...options,
    headers,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // üres vagy nem JSON válasz
  }

  if (!res.ok) {
    const payload = data as ApiErrorPayload | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message || `HTTP hiba (${res.status})`;

    throw new Error(message);
  }

  return data as T;
}
