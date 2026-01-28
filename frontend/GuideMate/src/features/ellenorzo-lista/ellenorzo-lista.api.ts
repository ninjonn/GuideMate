import { apiFetch } from "../../lib/api";

export type EllenorzoListaElemItem = {
  elem_id: number;
  megnevezes: string;
  kipipalva: boolean;
};

export type EllenorzoListaItem = {
  lista_id: number;
  lista_nev: string;
  elemek: EllenorzoListaElemItem[];
};

export type EllenorzoListaListResponse = {
  ellenorzolistak: EllenorzoListaItem[];
  osszesen: number;
};

export type EllenorzoListaCreateResponse = {
  lista_id: number;
  utazas_id: number;
  lista_nev: string;
  letrehozas_datuma: string;
};

export type EllenorzoListaDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_lista_id: number;
  torolt_elemek_szama: number;
};

export type CreateEllenorzoListaDto = {
  lista_nev: string;
};

export function listEllenorzoLista(utazasId: number) {
  return apiFetch<EllenorzoListaListResponse>(
    `/api/utazasok/${utazasId}/ellenorzolista`,
    { method: "GET" },
    true,
  );
}

export function createEllenorzoLista(
  utazasId: number,
  dto: CreateEllenorzoListaDto,
) {
  return apiFetch<EllenorzoListaCreateResponse>(
    `/api/utazasok/${utazasId}/ellenorzolista`,
    { method: "POST", body: JSON.stringify(dto) },
    true,
  );
}

export function deleteEllenorzoLista(listaId: number) {
  return apiFetch<EllenorzoListaDeleteResponse>(
    `/api/ellenorzolista/${listaId}`,
    { method: "DELETE" },
    true,
  );
}
