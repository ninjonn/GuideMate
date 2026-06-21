const API_BASE_URL = import.meta.env.VITE_API_URL;

// A tokent szinkron modon toltjuk be modulbetolteskor, hogy a vedett hivasok
// (pl. terkep) oldalfrissites utan is azonnal elerjek a tokent (ne legyen
// verseny az AppProviders useEffect-jevel).
let authToken: string | null =
  typeof localStorage !== "undefined" ? localStorage.getItem("gm_token") : null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Lejart/ervenytelen token eseten kileptetjuk a felhasznalot es a login
// oldalra iranyitunk. Igy nem "fagy meg" az app 1 ora utan (JWT lejarat).
function handleSessionExpired() {
  if (typeof window === "undefined") return;
  authToken = null;
  localStorage.removeItem("gm_token");
  localStorage.removeItem("gm_user");
  // Csak akkor iranyitunk, ha nem mar a login/regisztracio oldalon vagyunk
  // (vegtelen redirect ellen).
  const path = window.location.pathname;
  if (path !== "/bejelentkezes" && path !== "/regisztracio") {
    window.location.href = "/bejelentkezes";
  }
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

  const tokenWasSent = Boolean(auth && authToken);

  const res = await fetch(resolveUrl(path), {
    ...options,
    headers,
  });

  // Ha tokennel hivtunk es a szerver 401-et ad, a token lejart/ervenytelen:
  // kileptetunk. (A login/regisztracio auth=false, igy az ott kapott 401
  // nem valt ki kileptetest.)
  if (res.status === 401 && tokenWasSent) {
    handleSessionExpired();
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // üres
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
