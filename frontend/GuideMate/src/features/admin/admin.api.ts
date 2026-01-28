import { apiFetch } from "../../lib/api";

export type AdminUserListItem = {
  azonosito: number;
  nev: string;
  email: string;
  szerepkor: string;
  regisztracio_datum: string;
  utazasok_szama: number;
};

export type AdminUserListResponse = {
  felhasznalok: AdminUserListItem[];
  osszesen: number;
  oldal: number;
  oldalak_szama: number;
};

export type AdminUserDetailResponse = {
  azonosito: number;
  nev: string;
  email: string;
  szerepkor: string;
  regisztracio_datum: string;
  utazasok_szama: number;
  hozzaadott_elemek: {
    programok: number;
    foglalasok: number;
    ellenorzolistak: number;
  };
};

export type AdminUserRoleResponse = {
  azonosito: number;
  nev: string;
  email: string;
  szerepkor: string;
  sikeres: boolean;
  uzenet: string;
};

export type AdminUserDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_felhasznalo_id: number;
  torolt_utazasok: number;
  torolt_programok: number;
};

export type AdminStatsResponse = {
  felhasznalok: {
    osszesen: number;
    adminok: number;
    regular_users: number;
    mai_regisztraciok: number;
  };
  utazasok: {
    osszesen: number;
    aktiv: number;
    lezart: number;
    mai_letrehozasok: number;
  };
  programok: { osszesen: number };
  foglalasok: { osszesen: number };
  ellenorzolistak: { osszesen: number };
  utolso_frissites: string;
};

export type AdminUserQuery = {
  oldal?: number;
  limit?: number;
  kereses?: string;
  szerepkor?: "admin" | "user";
};

function buildQuery(query?: AdminUserQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.oldal) params.set("oldal", String(query.oldal));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.kereses) params.set("kereses", query.kereses);
  if (query.szerepkor) params.set("szerepkor", query.szerepkor);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function listAdminUsers(query?: AdminUserQuery) {
  return apiFetch<AdminUserListResponse>(
    `/api/admin/felhasznalok${buildQuery(query)}`,
    { method: "GET" },
    true,
  );
}

export function getAdminUser(userId: number) {
  return apiFetch<AdminUserDetailResponse>(
    `/api/admin/felhasznalok/${userId}`,
    { method: "GET" },
    true,
  );
}

export function updateAdminUserRole(
  userId: number,
  szerepkor: "admin" | "user",
) {
  return apiFetch<AdminUserRoleResponse>(
    `/api/admin/felhasznalok/${userId}`,
    { method: "PUT", body: JSON.stringify({ szerepkor }) },
    true,
  );
}

export function deleteAdminUser(userId: number) {
  return apiFetch<AdminUserDeleteResponse>(
    `/api/admin/felhasznalok/${userId}`,
    { method: "DELETE" },
    true,
  );
}

export function getAdminStats() {
  return apiFetch<AdminStatsResponse>(
    "/api/admin/statisztikak",
    { method: "GET" },
    true,
  );
}
