import { apiFetch } from "../../lib/api";

// Backend válasz típusok (részlegesen a használathoz)
export type UtazasListItem = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  programok_szama: number;
  jegyek_szama: number;
  ellenorzolistak_szama: number;
};

export type UtazasListResponse = {
  utazasok: UtazasListItem[];
  osszesen: number;
  oldal: number;
  oldalak_szama: number;
};

export type UtazasCreateResponse = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  letrehozas_datuma: string;
};

export type UtazasUpdateResponse = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  sikeres: boolean;
};

export type UtazasDetailResponse = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  letrehozas_datuma: string;
  programok: {
    azonosito: number;
    nev: string;
    leiras: string | null;
    nap_datum: string | null;
    kezdo_ido: string;
    veg_ido: string;
  }[];
};

export type CreateUtazasDto = {
  cim: string;
  leiras?: string;
  kezdo_datum: string;
  veg_datum: string;
};

export type UpdateUtazasDto = Partial<CreateUtazasDto>;

export type UtazasListQuery = {
  statusz?: "aktiv" | "lezart" | "torolt";
  rendez?: "datum" | "nev";
  oldal?: number;
  limit?: number;
};

function buildQuery(query?: UtazasListQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.statusz) params.set("statusz", query.statusz);
  if (query.rendez) params.set("rendez", query.rendez);
  if (query.oldal) params.set("oldal", String(query.oldal));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function listUtazasok(query?: UtazasListQuery) {
  return apiFetch<UtazasListResponse>(
    `/api/utazasok${buildQuery(query)}`,
    {},
    true,
  );
}

export function createUtazas(dto: CreateUtazasDto) {
  return apiFetch<UtazasCreateResponse>(
    "/api/utazasok",
    { method: "POST", body: JSON.stringify(dto) },
    true,
  );
}

export function updateUtazas(id: number, dto: UpdateUtazasDto) {
  return apiFetch<UtazasUpdateResponse>(
    `/api/utazasok/${id}`,
    { method: "PUT", body: JSON.stringify(dto) },
    true,
  );
}

export function getUtazas(id: number) {
  return apiFetch<UtazasDetailResponse>(`/api/utazasok/${id}`, {}, true);
}

export function deleteUtazas(id: number) {
  return apiFetch<{ sikeres: boolean; uzenet: string; torolt_utazas_id: number }>(
    `/api/utazasok/${id}`,
    { method: "DELETE" },
    true,
  );
}
