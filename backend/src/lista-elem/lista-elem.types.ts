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
