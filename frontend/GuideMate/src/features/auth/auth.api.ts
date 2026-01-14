// src/features/auth/auth.api.ts
import { apiFetch } from "../../lib/api";

export type LoginRequest = {
  email: string;
  jelszo: string;
};

export type LoginResponse = {
  token: string;
  felhasznalo: {
    azonosito: number;
    nev: string;
    email: string;
    szerepkor: string;
  };
};

export type RegisterRequest = {
  vezeteknev: string;
  keresztnev: string;
  email: string;
  jelszo: string;
};

export type RegisterResponse = {
  azonosito: number;
  nev: string;
  email: string;
  szerepkor: string;
  regisztracio_datum: string;
};

export type ProfileResponse = {
  azonosito: number;
  nev: string;
  email: string;
  regisztracio_datum: string;
  szerepkor: string;
  utazasok_szama: number;
};

export function login(dto: LoginRequest) {
  return apiFetch<LoginResponse>("/api/auth/bejelentkezes", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function register(dto: RegisterRequest) {
  return apiFetch<RegisterResponse>("/api/auth/regisztracio", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}


export const getProfile = async (): Promise<ProfileResponse> => {
  // Auth-olt profil végpont mindig az /api prefixel
  return apiFetch<ProfileResponse>("/api/felhasznalok/profil", {}, true);
};
