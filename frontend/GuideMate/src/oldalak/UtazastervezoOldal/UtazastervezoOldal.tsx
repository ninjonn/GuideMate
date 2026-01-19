import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  Grid,
  useToast,
  SimpleGrid,
  Divider,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  listUtazasok,
  type UtazasListItem,
} from '../../features/utazas/utazas.api';

// --- Típusok ---
type ChecklistItem = {
  id: number;
  text: string;
  isChecked: boolean;
};

type Trip = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  days: number;
  programs: number;
  checklistDone: number;
  checklistTotal: number;
};

const initialChecklist: ChecklistItem[] = [
  { id: 1, text: "Útlevél", isChecked: false },
  { id: 2, text: "Hátizsák", isChecked: false },
  { id: 3, text: "Szemüveg", isChecked: true },
  { id: 4, text: "Pénztárca", isChecked: false },
  { id: 5, text: "Víz", isChecked: false },
  { id: 6, text: "Sapka", isChecked: false },
];

const calcDays = (start: string, end: string): number => {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;
  const diff = Math.max(0, endMs - startMs);
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

const mapListItemToTrip = (item: UtazasListItem): Trip => {
  return {
    id: item.azonosito,
    title: item.cim,
    description: item.leiras ?? "",
    startDate: item.kezdo_datum,
    endDate: item.veg_datum,
    days: calcDays(item.kezdo_datum, item.veg_datum),
    programs: item.programok_szama,
    checklistDone: 0,
    checklistTotal: item.ellenorzolistak_szama ?? 0,
  };
};

// --- Stílus Konstansok ---
const glassStyle = {
  bg: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  borderRadius: "20px",
};

const UtazastervezoOldal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Modal vezérlők (csak a checklisthez)
  const checklistModal = useDisclosure();
  
  // State-ek
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Input state-ek a checklist modalhoz
  const [newItemName, setNewItemName] = useState("");

  // --- Handlerek ---

  const handleEditTrip = (id: number) => {
    navigate(`/utazas-szerkesztese/${id}`);
  };

  const handleOpenTrip = (id: number) => {
    navigate(`/utazas/${id}`);
  };

  const handleToggleItem = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  // --- Checklist Modal Logic ---
  const handleAddItemClick = () => {
    setNewItemName("");
    checklistModal.onOpen();
  };

  const confirmAddItem = () => {
    if (newItemName.trim() === "") {
      toast({ title: "Adj meg egy nevet!", status: "warning", duration: 2000 });
      return;
    }
    const newItem: ChecklistItem = {
      id: Date.now(),
      text: newItemName,
      isChecked: false
    };
    setChecklist([...checklist, newItem]);
    checklistModal.onClose();
    toast({ title: "Elem hozzáadva", status: "success", duration: 1500 });
  };

  const handleDeleteChecked = () => {
    const newList = checklist.filter(item => !item.isChecked);
    if (newList.length === checklist.length) {
      toast({ title: "Nincs kijelölt elem", status: "warning", duration: 1000 });
    } else {
      setChecklist(newList);
      toast({ title: "Kijelölt elemek törölve", status: "success", duration: 1000 });
    }
  };

  const handleSaveChecklist = () => {
    toast({ title: "Lista mentve", status: "success", duration: 2000 });
  };

  // --- Új út hozzáadása: átirányítás külön oldalra ---
  const handleAddTripClick = () => {
    navigate('/uj-ut-hozzaadasa');
  };

  // Érkező új/frissített utazás (navigate state) hozzáadása a listához
  useEffect(() => {
    const state = location.state as { ujTrip?: Trip; frissitettTrip?: Trip } | null;
    if (state?.ujTrip || state?.frissitettTrip) {
      setTrips((prev) => {
        let next = [...prev];
        if (state.frissitettTrip) {
          const idx = next.findIndex((t) => t.id === state.frissitettTrip!.id);
          if (idx >= 0) {
            next[idx] = state.frissitettTrip!;
          } else {
            next = [...next, state.frissitettTrip!];
          }
        }
        if (state.ujTrip && !next.some((t) => t.id === state.ujTrip!.id)) {
          next = [...next, state.ujTrip!];
        }
        return next;
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  // Utazások betöltése a backendről
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTrips(true);
        setLoadError(null);
        const res = await listUtazasok();
        const mapped: Trip[] = res.utazasok.map(mapListItemToTrip);
        setTrips(mapped);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
        setLoadError(msg);
        toast({
          title: "Nem sikerült betölteni az utazásokat",
          description: msg,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoadingTrips(false);
      }
    };

    void load();
  }, [toast]);

  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      pt={{ base: 24, md: 32 }}
      pb={10}
      overflowX="hidden"
    >
      <Container maxW="1400px">
        
        <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
          
          {/* --- BAL OSZLOP: Utazó ellenőrzőlista --- */}
          <Box 
            {...glassStyle} 
            p={6} 
            height="fit-content"
          >
            <Heading size="md" mb={6} textAlign="center">
              Utazó ellenőrzőlista
            </Heading>

            <VStack spacing={4} align="stretch">
              
              <HStack>
                <Button 
                  size="sm" 
                  bg="white" 
                  color="#232B5C" 
                  flex={1}
                  borderRadius="full"
                  _hover={{ bg: "gray.200" }}
                  onClick={handleAddItemClick} 
                >
                  Hozzáadás
                </Button>
                <Button 
                  size="sm" 
                  bg="rgba(255,255,255,0.3)" 
                  color="white" 
                  flex={1}
                  borderRadius="full"
                  _hover={{ bg: "rgba(255,255,255,0.4)" }}
                  onClick={handleDeleteChecked}
                >
                  Törlés
                </Button>
              </HStack>

              <Divider borderColor="whiteAlpha.400" />

              <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" pr={1}>
                {checklist.length === 0 && (
                  <Text fontSize="sm" opacity={0.7} textAlign="center">A lista üres.</Text>
                )}
                
                {checklist.map((item) => (
                  <Checkbox
                    key={item.id}
                    isChecked={item.isChecked}
                    onChange={() => handleToggleItem(item.id)}
                    colorScheme="whiteAlpha"
                    size="lg"
                    spacing="1rem"
                    sx={{
                      '.chakra-checkbox__control': {
                        borderColor: 'whiteAlpha.800',
                        _checked: {
                           bg: '#232B5C',
                           borderColor: '#232B5C',
                           color: 'white'
                        }
                      },
                      '.chakra-checkbox__label': {
                        fontSize: 'md',
                        fontWeight: '500'
                      }
                    }}
                  >
                    {item.text}
                  </Checkbox>
                ))}
              </VStack>

              <Button
                mt={4}
                bg="#3B49DF"
                color="white"
                size="lg"
                width="100%"
                borderRadius="xl"
                _hover={{ filter: "brightness(1.2)" }}
                boxShadow="0 4px 15px rgba(0,0,0,0.2)"
                onClick={handleSaveChecklist}
              >
                Mentés
              </Button>

            </VStack>
          </Box>

          {/* --- JOBB OSZLOP: Utazások listája + Új út form --- */}
          <Box>
            <Box mb={8}>
              <Heading size="2xl" mb={2} fontWeight="700">Utazástervezés</Heading>
              <Text fontSize="lg" opacity={0.9} maxW="600px" mb={5}>
                Hozz létre utazásokat és állíts össze ellenőrzőlistát, hogy ne felejts el semmit
              </Text>
              
              <Button
                leftIcon={<AddIcon />}
                bg="#232B5C"
                color="white"
                size="lg"
                px={8}
                borderRadius="lg"
                _hover={{ bg: "#1a214d", transform: "scale(1.02)" }}
                transition="all 0.2s"
                boxShadow="lg"
                onClick={handleAddTripClick}
              >
                új út hozzáadása
              </Button>
            </Box>

            {/* Kártyák Grid */}
            {loadError && (
              <Text color="red.100" mb={4}>
                {loadError}
              </Text>
            )}
            {loadingTrips ? (
              <Text color="whiteAlpha.900">Betöltés...</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {trips.map((trip) => (
                  <Box
                    key={trip.id}
                    {...glassStyle}
                    p={6}
                    transition="transform 0.2s"
                    _hover={{ transform: "translateY(-4px)" }}
                  >
                    <Heading size="lg" mb={2}>{trip.title}</Heading>
                    {trip.description && (
                      <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                        {trip.description}
                      </Text>
                    )}
                    
                    <VStack align="start" spacing={1} mb={6} color="whiteAlpha.900">
                      <Text fontSize="sm">{trip.startDate} → {trip.endDate}</Text>
                      <Text fontSize="md">{trip.days} nap</Text>
                      <Text fontSize="md">{trip.programs} program</Text>
                      <Text fontSize="sm" opacity={0.8}>
                        Ellenőrzőlista: {trip.checklistDone}/{trip.checklistTotal} kész
                      </Text>
                    </VStack>

                    <HStack spacing={4}>
                      <Button
                        bg="#232B5C"
                        color="white"
                        flex={1}
                        borderRadius="lg"
                        _hover={{ filter: "brightness(1.2)" }}
                        onClick={() => handleOpenTrip(trip.id)}
                      >
                        Megnyitás
                      </Button>
                      <Button
                        bg="white"
                        color="#232B5C"
                        flex={1}
                        borderRadius="lg"
                        _hover={{ bg: "gray.100" }}
                        onClick={() => handleEditTrip(trip.id)}
                      >
                        Szerkesztés
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

        </Grid>
      </Container>

      {/* --- MODAL 1: Checklist Elem Hozzáadása --- */}
      <Modal isOpen={checklistModal.isOpen} onClose={checklistModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="white" borderRadius="20px" boxShadow="xl">
          <ModalHeader color="#232B5C">Új elem hozzáadása</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input 
              placeholder="Pl. Naptej" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              focusBorderColor="#232B5C"
              size="lg"
              onKeyDown={(e) => { if (e.key === 'Enter') confirmAddItem(); }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={checklistModal.onClose}>Mégse</Button>
            <Button bg="#232B5C" color="white" _hover={{ bg: "#1a214d" }} onClick={confirmAddItem}>Hozzáadás</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default UtazastervezoOldal;
