import { apiRequest } from "@/lib/api";

export type LoginResponse = {
  token: string;
  felhasznalo: {
    azonosito: number;
    nev: string;
    email: string;
    szerepkor: string;
  };
};

export function useAuth() {
  const login = (email: string, jelszo: string) => {
    return apiRequest<LoginResponse>("/api/auth/bejelentkezes", {
      method: "POST",
      body: JSON.stringify({ email, jelszo }),
    });
  };

  const register = (
    vezeteknev: string,
    keresztnev: string,
    email: string,
    jelszo: string
  ) => {
    return apiRequest("/api/auth/regisztracio", {
      method: "POST",
      body: JSON.stringify({
        vezeteknev,
        keresztnev,
        email,
        jelszo,
      }),
    });
  };

  return { login, register };
}