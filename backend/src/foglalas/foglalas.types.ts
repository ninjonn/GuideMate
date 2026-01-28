// Az API valaszainak tipizalasa, hogy a controller tiszta legyen.

// Repulo tipusu foglalas valasz forma.
export type FoglalasRepuloItem = {
  azonosito: number;
  tipus: 'repulo';
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: string;
  erkezesi_ido: string;
  jaratszam: string | null;
};

// Busz tipusu foglalas valasz forma.
export type FoglalasBuszItem = {
  azonosito: number;
  tipus: 'busz';
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: string;
  erkezesi_ido: string;
  jaratszam: string | null;
};

// Vonat tipusu foglalas valasz forma.
export type FoglalasVonatItem = {
  azonosito: number;
  tipus: 'vonat';
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: string;
  erkezesi_ido: string;
  jaratszam: string | null;
};

// Szallas tipusu foglalas valasz forma.
export type FoglalasSzallasItem = {
  azonosito: number;
  tipus: 'szallas';
  hely: string;
  cim: string;
  kezdo_datum: string;
  veg_datum: string;
};

// Lista tetele a ket formatum kozul az egyik.
export type FoglalasListItem =
  | FoglalasRepuloItem
  | FoglalasBuszItem
  | FoglalasVonatItem
  | FoglalasSzallasItem;

// Lista valasz, osszes elem szammal.
export type FoglalasListResponse = {
  foglalasok: FoglalasListItem[];
  osszesen: number;
};

// Letrehozas valasz, letrehozas_datuma mezovel.
export type FoglalasCreateResponse = {
  azonosito: number;
  letrehozas_datuma: string;
} & (
  | FoglalasRepuloItem
  | FoglalasBuszItem
  | FoglalasVonatItem
  | FoglalasSzallasItem
);

// Frissites valasz, sikeres jelzessel.
export type FoglalasUpdateResponse = {
  sikeres: boolean;
} & (
  | FoglalasRepuloItem
  | FoglalasBuszItem
  | FoglalasVonatItem
  | FoglalasSzallasItem
);

// Torles valasz, visszajelzessel.
export type FoglalasDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_foglalas_id: number;
};
