import React, { useEffect, useState } from 'react';
import {
  Box,
  Center,
  VStack,
  Text,
  Avatar,
  Flex,
  IconButton,
  Button,
  Spinner,
  useToast,
  useDisclosure,
  HStack,
  Divider,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

// JAVÍTÁS ITT: 'type ProfileResponse' explicit jelölése
import { getProfile, type ProfileResponse } from '../../features/auth/auth.api';
import { setAuthToken } from '../../lib/api';
import { changePassword, updateProfile } from '../../features/users/users.api';

const AvatarIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const ProfilOldal: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const toast = useToast();
  const profileModal = useDisclosure();
  const passwordModal = useDisclosure();

  const [profileDraft, setProfileDraft] = useState({
    vezeteknev: "",
    keresztnev: "",
    email: "",
  });
  const [passwordDraft, setPasswordDraft] = useState({
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
        <Box
          // Reszponzív szélesség, max ~788px (a design szerint)
          w={{ base: '100%', md: '600px', lg: '700px' }}
          p={{ base: 6, md: 10 }}
          // Glassmorphism stílusok
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(12px)"
          borderRadius="15px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {profile && (
            <VStack spacing={6} w="100%">
              
              {/* Avatar és Név */}
              <VStack spacing={3}>
                <Avatar 
                  size="2xl" 
                  name="" 
                  bg="#232B5C" 
                  color="white"
                  border="2px solid rgba(255,255,255,0.6)"
                  showBorder={true}
                  icon={<AvatarIcon boxSize={10} />}
                />
                <Text fontSize="2xl" fontWeight="700">
                  {profile.nev}
                </Text>
              </VStack>

              <Divider borderColor="rgba(255,255,255,0.3)" />

              {/* Adatmezők */}
              <VStack spacing={4} w="100%" align="stretch">
                <DataRow 
                  label="Név" 
                  value={profile.nev} 
                  onEdit={openProfileEdit} 
                />
                <DataRow 
                  label="Email" 
                  value={profile.email} 
                  onEdit={openProfileEdit} 
                />
                <DataRow 
                  label="Jelszó" 
                  value="••••••••••••" 
                  onEdit={openPasswordEdit} 
                />
              </VStack>

              {/* Utazások száma Badge */}
              <Box
                mt={4}
                px={4}
                py={2}
                bg="rgba(255, 255, 255, 0.2)"
                borderRadius="full"
                border="1px solid rgba(255, 255, 255, 0.3)"
              >
                <Text fontSize="sm" fontWeight="600">
                  Utazások száma: {profile.utazasok_szama}
                </Text>
              </Box>

              {/* Kijelentkezés Gomb */}
              <Button
                w="100%"
                h="50px"
                mt={4}
                fontSize="lg"
                fontWeight="600"
                bg="#232B5C"
                _hover={{
                  filter: "brightness(1.2)",
                  transform: "scale(1.02)",
                }}
                transition="all 0.3s ease"
                color="white"
                borderRadius="lg"
                boxShadow="0 4px 15px rgba(0,0,0,0.2)"
                onClick={handleLogout}
              >
                Kijelentkezés
              </Button>

            </VStack>
          )}
        </Box>
      </Center>

      <Modal isOpen={profileModal.isOpen} onClose={profileModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Profil szerkesztése</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Vezetéknév</FormLabel>
                <Input
                  value={profileDraft.vezeteknev}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, vezeteknev: e.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Keresztnév</FormLabel>
                <Input
                  value={profileDraft.keresztnev}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, keresztnev: e.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={profileDraft.email}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={profileModal.onClose}>
              Mégse
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => void handleSaveProfile()}
              isLoading={savingProfile}
            >
              Mentés
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={passwordModal.isOpen} onClose={passwordModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Jelszó módosítása</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Régi jelszó</FormLabel>
                <Input
                  type="password"
                  value={passwordDraft.regi}
                  onChange={(e) =>
                    setPasswordDraft((prev) => ({ ...prev, regi: e.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Új jelszó</FormLabel>
                <Input
                  type="password"
                  value={passwordDraft.uj}
                  onChange={(e) =>
                    setPasswordDraft((prev) => ({ ...prev, uj: e.target.value }))
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={passwordModal.onClose}>
              Mégse
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => void handleSavePassword()}
              isLoading={savingPassword}
            >
              Mentés
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// --- Segédkomponens a sorokhoz ---
interface DataRowProps {
  label: string;
  value: string;
  onEdit: () => void;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, onEdit }) => {
  return (
    <Flex 
      align="center" 
      justify="space-between" 
      w="100%" 
      borderBottom="1px solid rgba(255,255,255,0.3)" 
      pb={2}
    >
      <HStack spacing={4} flex={1}>
        <Text w="80px" fontSize="sm" color="whiteAlpha.700" fontWeight="500">
          {label}
        </Text>
        <Text fontSize="md" fontWeight="500" isTruncated>
          {value}
        </Text>
      </HStack>
      
      <IconButton
        aria-label={`Edit ${label}`}
        icon={<EditIcon />}
        variant="ghost"
        color="whiteAlpha.800"
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
        size="sm"
        onClick={onEdit}
      />
    </Flex>
  );
};

export default ProfilOldal;
