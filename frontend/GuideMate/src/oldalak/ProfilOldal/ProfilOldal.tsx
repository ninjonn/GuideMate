import React, { useEffect, useState } from 'react';
import {
  Box,
  Center,
  Button,
  Spinner,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// JAVÍTÁS ITT: 'type ProfileResponse' explicit jelölése
import { getProfile, type ProfileResponse } from '../../features/auth/auth.api';
import { setAuthToken } from '../../lib/api';
import { changePassword, updateProfile } from '../../features/users/users.api';
import ProfilAdatok from './komponensek/ProfilAdatok';
import {
  JelszoModal,
  ProfilSzerkesztesModal,
  type PasswordDraft,
  type ProfileDraft,
} from './komponensek/ProfilSzerkesztes';

const ProfilOldal: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const toast = useToast();
  const profileModal = useDisclosure();
  const passwordModal = useDisclosure();

  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    vezeteknev: "",
    keresztnev: "",
    email: "",
  });
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>({
    regi: "",
    uj: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // --- Kijelentkezés logikája ---
  const handleLogout = () => {
    // 1. Helyi adatok törlése
    localStorage.removeItem('gm_token');
    localStorage.removeItem('gm_user');
    
    // 2. API token nullázása a memóriában
    setAuthToken(null);
    
    // 3. Visszajelzés
    toast({
      title: 'Sikeres kijelentkezés',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    // 4. Átirányítás a bejelentkezéshez
    navigate('/bejelentkezes');
  };

  const openProfileEdit = () => {
    if (!profile) return;
    const parts = profile.nev.split(" ").filter(Boolean);
    const vezeteknev = parts[0] ?? "";
    const keresztnev = parts.slice(1).join(" ");
    setProfileDraft({
      vezeteknev,
      keresztnev,
      email: profile.email,
    });
    profileModal.onOpen();
  };

  const openPasswordEdit = () => {
    setPasswordDraft({ regi: "", uj: "" });
    passwordModal.onOpen();
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    const vezeteknev = profileDraft.vezeteknev.trim();
    const keresztnev = profileDraft.keresztnev.trim();
    const email = profileDraft.email.trim();

    if ((vezeteknev && !keresztnev) || (!vezeteknev && keresztnev)) {
      toast({
        title: "A név mezők együtt kötelezők",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const dto: { vezeteknev?: string; keresztnev?: string; email?: string } = {};
    if (vezeteknev && keresztnev) {
      dto.vezeteknev = vezeteknev;
      dto.keresztnev = keresztnev;
    }
    if (email && email !== profile.email) {
      dto.email = email;
    }

    if (Object.keys(dto).length === 0) {
      toast({
        title: "Nincs változás",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setSavingProfile(true);
      const res = await updateProfile(dto);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nev: res.nev,
              email: res.email,
            }
          : prev,
      );
      localStorage.setItem(
        "gm_user",
        JSON.stringify({
          ...(profile ?? {}),
          nev: res.nev,
          email: res.email,
        }),
      );
      profileModal.onClose();
      toast({
        title: res.uzenet || "Profil frissítve",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Profil frissítés sikertelen",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    const regi = passwordDraft.regi.trim();
    const uj = passwordDraft.uj.trim();
    if (!regi || !uj) {
      toast({
        title: "Add meg a régi és az új jelszót",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      setSavingPassword(true);
      const res = await changePassword({
        regi_jelszo: regi,
        uj_jelszo: uj,
      });
      passwordModal.onClose();
      toast({
        title: res.uzenet || "Jelszó frissítve",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Jelszócsere sikertelen",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // --- Adatbetöltés és Auth ellenőrzés ---
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('gm_token');

      // Ha nincs token, azonnal login
      if (!token) {
        navigate('/bejelentkezes');
        return;
      }

      // Token beállítása az api.ts számára
      setAuthToken(token);

      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error: unknown) {
        console.error('Profil betöltési hiba:', error);
        
        // Ha hiba van (pl. 401 lejárt token), kijelentkeztetünk
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // --- Betöltés állapot ---
  if (loading) {
    return (
      <Box
        minH="100vh"
        w="100vw"
        bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="white" thickness="4px" />
      </Box>
    );
  }

  // --- Megjelenítés ---
  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      position="relative"
      overflow="hidden"
      color="white"
      pt={{ base: 24, md: 32 }} // Hely a navbarnak
    >
      <Center minH="100vh" px={4} pb={10} mt={-20}>
        {profile && (
          <ProfilAdatok
            profile={profile}
            onEditProfile={openProfileEdit}
            onEditPassword={openPasswordEdit}
            onLogout={handleLogout}
          />
        )}
      </Center>

      <ProfilSzerkesztesModal
        isOpen={profileModal.isOpen}
        onClose={profileModal.onClose}
        draft={profileDraft}
        onDraftChange={setProfileDraft}
        onSave={() => void handleSaveProfile()}
        isSaving={savingProfile}
      />

      <JelszoModal
        isOpen={passwordModal.isOpen}
        onClose={passwordModal.onClose}
        draft={passwordDraft}
        onDraftChange={setPasswordDraft}
        onSave={() => void handleSavePassword()}
        isSaving={savingPassword}
      />
    </Box>
  );
};

export default ProfilOldal;
