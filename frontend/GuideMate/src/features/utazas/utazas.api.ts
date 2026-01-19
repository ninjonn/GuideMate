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
  programok: { azonosito: number; nev: string; nap_datum: string | null }[];
  foglalasok: { azonosito: number; tipus: string; jaratszam: string | null }[];
};

export type CreateUtazasDto = {
  cim: string;
  leiras?: string;
  kezdo_datum: string;
  veg_datum: string;
};

export type UpdateUtazasDto = Partial<CreateUtazasDto>;

export function listUtazasok() {
  return apiFetch<UtazasListResponse>("/api/utazasok", {}, true);
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
