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
