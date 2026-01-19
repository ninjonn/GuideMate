import { apiFetch } from "../../lib/api";

export type FoglalasTipus = "repulo" | "busz" | "vonat" | "szallas";

export type TravelFoglalas = {
  azonosito: number;
  tipus: "repulo" | "busz" | "vonat";
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: string; // ISO
  erkezesi_ido: string; // ISO
  jaratszam?: string | null;
};

export type SzallasFoglalas = {
  azonosito: number;
  tipus: "szallas";
  hely: string;
  cim: string;
  kezdo_datum: string; // YYYY-MM-DD
  veg_datum: string; // YYYY-MM-DD
};

export type Foglalas = TravelFoglalas | SzallasFoglalas;

export type CreateTravelDto = {
  tipus: "repulo" | "busz" | "vonat";
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: string; // ISO
  erkezesi_ido: string; // ISO
  jaratszam?: string | null;
};

export type CreateSzallasDto = {
  tipus: "szallas";
  hely: string;
  cim: string;
  kezdo_datum: string; // YYYY-MM-DD
  veg_datum: string; // YYYY-MM-DD
};

export type CreateFoglalasDto = CreateTravelDto | CreateSzallasDto;


export type UpdateFoglalasDto = Partial<CreateFoglalasDto> & { tipus: FoglalasTipus };

export async function listFoglalasok(utazasId: number): Promise<Foglalas[]> {
  const res = await apiFetch<{ foglalasok: Foglalas[] }>(
    `/api/utazasok/${utazasId}/foglalasok`,
    { method: "GET" },
    true,
  );
  return res.foglalasok;
}

export function createFoglalas(utazasId: number, dto: CreateFoglalasDto) {
  return apiFetch<Foglalas>(
    `/api/utazasok/${utazasId}/foglalasok`,
    { method: "POST", body: JSON.stringify(dto) },
    true,
  );
}

export function updateFoglalas(id: number, dto: UpdateFoglalasDto) {
  return apiFetch<Foglalas>(
    `/api/foglalasok/${id}`,
    { method: "PUT", body: JSON.stringify(dto) },
    true,
  );
}

export function deleteFoglalas(id: number) {
  return apiFetch<{ sikeres?: boolean }>(
    `/api/foglalasok/${id}`,
    { method: "DELETE" },
    true,
  );
}
