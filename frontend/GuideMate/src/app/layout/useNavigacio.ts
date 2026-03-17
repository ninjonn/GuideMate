import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProfile } from "../../features/auth/auth.api";
import { setAuthToken } from "../../lib/api";

type MenuItem = {
  label: string;
  to: string;
};

const getLinkStyles = (isActive: boolean) => ({
  bg: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
  hoverBg: isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)",
  backdropFilter: isActive ? "blur(4px)" : "none",
});

const loadStoredRole = () => {
  const raw = localStorage.getItem("gm_user");
  if (!raw) return undefined;
  try {
    const user = JSON.parse(raw) as { szerepkor?: string } | null;
    return user?.szerepkor;
  } catch {
    return undefined;
  }
};

export const useNavigacio = () => {
  const disclosure = useDisclosure();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      const token = localStorage.getItem("gm_token");
      const storedRole = loadStoredRole();

      if (!token) {
        if (mounted) {
          setIsAuthed(false);
          setIsAdmin(false);
        }
        return;
      }

      if (mounted) setIsAuthed(true);

      if (storedRole === "admin") {
        if (mounted) setIsAdmin(true);
        return;
      }

      setAuthToken(token);
      try {
        const profile = await getProfile();
        if (!mounted) return;
        setIsAdmin(profile.szerepkor === "admin");
        localStorage.setItem(
          "gm_user",
          JSON.stringify({
            azonosito: profile.azonosito,
            nev: profile.nev,
            email: profile.email,
            szerepkor: profile.szerepkor,
          }),
        );
      } catch {
        if (mounted) setIsAdmin(false);
      }
    };

    void loadRole();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const menuItems = useMemo<MenuItem[]>(() => {
    return [
      { label: "Főoldal", to: "/" },
      { label: "Térkép", to: "/terkep" },
      ...(isAuthed
        ? [
            { label: "Utazástervezés", to: "/utazastervezo" },
            { label: "Jegykövetés", to: "/jegykovetes" },
            ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []),
          ]
        : []),
    ];
  }, [isAuthed, isAdmin]);

  return {
    disclosure,
    location,
    isAuthed,
    menuItems,
    getLinkStyles,
  };
};
