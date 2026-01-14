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
  HStack,
  Divider,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

// JAVÍTÁS ITT: 'type ProfileResponse' explicit jelölése
import { getProfile, type ProfileResponse } from '../../features/auth/auth.api';
import { setAuthToken } from '../../lib/api';

const ProfilOldal: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const toast = useToast();

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

  // --- UI eseménykezelő (Checkpoint 2) ---
  const handleEditClick = () => {
    toast({
      title: 'Checkpoint 2',
      description: 'Szerkesztés később',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
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
      } catch (error: any) {
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
                  name={profile.nev} 
                  bg="#232B5C" 
                  color="white"
                  border="2px solid rgba(255,255,255,0.6)"
                  showBorder={true}
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
                  onEdit={handleEditClick} 
                />
                <DataRow 
                  label="Email" 
                  value={profile.email} 
                  onEdit={handleEditClick} 
                />
                <DataRow 
                  label="Jelszó" 
                  value="••••••••••••" 
                  onEdit={handleEditClick} 
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