import { Prisma } from '@prisma/client';

export type UtazasListItem = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  programok_szama: number;
  jegyek_szama: number;
  ellenorzolistak_szama: number;
  ellenorzolista_pipialt: number;
  ellenorzolista_osszes: number;
};

export type UtazasListResponse = {
  utazasok: UtazasListItem[];
  osszesen: number;
  oldal: number;
  oldalak_szama: number;
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
    nap_datum: string;
    kezdo_ido: string;
    veg_ido: string;
  }[];
};

export type UtazasWithProgramok = Prisma.UtazasGetPayload<{
  include: {
    programok: {
      select: {
        program_id: true;
        program_nev: true;
        leiras: true;
        nap_datum: true;
        kezdo_ido: true;
        veg_ido: true;
      };
    };
  };
}>;

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

export type UtazasDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_utazas_id: number;
};
