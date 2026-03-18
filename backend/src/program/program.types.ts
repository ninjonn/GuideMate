export type ProgramListItem = {
  azonosito: number;
  nev: string;
  leiras: string | null;
  nap_datum: string | null;
  kezdo_ido: string;
  veg_ido: string;
  letrehozas_datuma: string;
};

export type ProgramListResponse = {
  programok: ProgramListItem[];
  osszesen: number;
};

export type ProgramCreateResponse = {
  azonosito: number;
  utazas_id: number;
  nev: string;
  leiras: string | null;
  nap_datum: string;
  kezdo_ido: string;
  veg_ido: string;
  letrehozas_datuma: string;
};

export type ProgramUpdateResponse = {
  azonosito: number;
  nev: string;
  leiras: string | null;
  nap_datum: string | null;
  kezdo_ido: string;
  veg_ido: string;
  sikeres: boolean;
};

export type ProgramDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_program_id: number;
};
