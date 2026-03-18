export type TravelType = 'repulo' | 'busz' | 'vonat' | 'auto';

export type FoglalasTravelItem = {
  azonosito: number;
  tipus: TravelType;
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: string;
  erkezesi_ido: string;
  jaratszam: string | null;
};

export type FoglalasSzallasItem = {
  azonosito: number;
  tipus: 'szallas';
  hely: string;
  cim: string;
  kezdo_datum: string;
  veg_datum: string;
};

export type FoglalasListItem = FoglalasTravelItem | FoglalasSzallasItem;

export type FoglalasListResponse = {
  foglalasok: FoglalasListItem[];
  osszesen: number;
};

export type FoglalasCreateResponse = {
  azonosito: number;
  letrehozas_datuma: string;
} & FoglalasListItem;

export type FoglalasUpdateResponse = {
  sikeres: boolean;
} & FoglalasListItem;

export type FoglalasDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_foglalas_id: number;
};
