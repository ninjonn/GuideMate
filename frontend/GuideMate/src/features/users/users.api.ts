import { apiFetch } from "../../lib/api";

export type UpdateProfileDto = {
  vezeteknev?: string;
  keresztnev?: string;
  email?: string;
};

export type UpdateProfileResponse = {
  azonosito: number;
  nev: string;
  email: string;
  sikeres: boolean;
  uzenet: string;
};

export type ChangePasswordDto = {
  regi_jelszo: string;
  uj_jelszo: string;
};

export type ChangePasswordResponse = {
  sikeres: boolean;
  uzenet: string;
};

export function updateProfile(dto: UpdateProfileDto) {
  return apiFetch<UpdateProfileResponse>(
    "/api/felhasznalok/profil",
    { method: "PUT", body: JSON.stringify(dto) },
    true,
  );
}

export function changePassword(dto: ChangePasswordDto) {
  return apiFetch<ChangePasswordResponse>(
    "/api/felhasznalok/jelszo",
    { method: "PUT", body: JSON.stringify(dto) },
    true,
  );
}
