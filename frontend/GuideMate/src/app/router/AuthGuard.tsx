import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("gm_token");

  if (!token) {
    return <Navigate to="/bejelentkezes" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
