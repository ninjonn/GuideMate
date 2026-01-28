import { apiFetch } from "../../lib/api";

export type ListaElemCreateResponse = {
  elem_id: number;
  lista_id: number;
  megnevezes: string;
  kipipalva: boolean;
  letrehozas_datuma: string;
};

export type ListaElemUpdateResponse = {
  elem_id: number;
  megnevezes: string;
  kipipalva: boolean;
  sikeres: boolean;
};

export type ListaElemDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_elem_id: number;
};

export type CreateListaElemDto = {
  megnevezes: string;
};

export type UpdateListaElemDto = {
  megnevezes?: string;
  kipipalva?: boolean;
};

export function createListaElem(listaId: number, dto: CreateListaElemDto) {
  return apiFetch<ListaElemCreateResponse>(
    `/api/ellenorzolista/${listaId}/elemek`,
    { method: "POST", body: JSON.stringify(dto) },
    true,
  );
}

export function updateListaElem(elemId: number, dto: UpdateListaElemDto) {
  return apiFetch<ListaElemUpdateResponse>(
    `/api/ellenorzolista/elemek/${elemId}`,
    { method: "PUT", body: JSON.stringify(dto) },
    true,
  );
}

export function deleteListaElem(elemId: number) {
  return apiFetch<ListaElemDeleteResponse>(
    `/api/ellenorzolista/elemek/${elemId}`,
    { method: "DELETE" },
    true,
  );
}
