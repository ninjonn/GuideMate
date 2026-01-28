import { apiFetch } from "../../lib/api";

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

export type CreateProgramDto = {
  nev: string;
  leiras?: string;
  nap_datum: string;
  kezdo_ido: string;
  veg_ido: string;
};

export type UpdateProgramDto = Partial<CreateProgramDto>;

export function listPrograms(utazasId: number) {
  return apiFetch<ProgramListResponse>(
    `/api/utazasok/${utazasId}/programok`,
    { method: "GET" },
    true,
  );
}

export function createProgram(utazasId: number, dto: CreateProgramDto) {
  return apiFetch<ProgramCreateResponse>(
    `/api/utazasok/${utazasId}/programok`,
    { method: "POST", body: JSON.stringify(dto) },
    true,
  );
}

export function updateProgram(programId: number, dto: UpdateProgramDto) {
  return apiFetch<ProgramUpdateResponse>(
    `/api/programok/${programId}`,
    { method: "PUT", body: JSON.stringify(dto) },
    true,
  );
}

export function deleteProgram(programId: number) {
  return apiFetch<ProgramDeleteResponse>(
    `/api/programok/${programId}`,
    { method: "DELETE" },
    true,
  );
}
