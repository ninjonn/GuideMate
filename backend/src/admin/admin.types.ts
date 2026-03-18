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
