import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type AuthGuardProps = {
  children: React.ReactNode;
};

// JWT lejarat ellenorzese DB/halozat nelkul: a payload "exp" mezojet nezzuk.
// Ha nem dekodolhato vagy lejart, ervenytelennek tekintjuk.
function isTokenValid(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return false;
    const payload = JSON.parse(atob(payloadPart)) as { exp?: number };
    if (!payload.exp) return false;
    // exp masodpercben van, Date.now() ezredmasodpercben
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("gm_token");

  if (!token || !isTokenValid(token)) {
    // Lejart token takaritasa, hogy ne maradjon szemet a tarolban.
    if (token) {
      localStorage.removeItem("gm_token");
      localStorage.removeItem("gm_user");
    }
    return (
      <Navigate
        to="/bejelentkezes"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
