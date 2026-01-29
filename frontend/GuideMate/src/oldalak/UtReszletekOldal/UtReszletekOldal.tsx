import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Divider,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  GridItem,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, CheckIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getUtazas, updateUtazas } from '../../features/utazas/utazas.api';
import { createProgram, deleteProgram, updateProgram } from '../../features/program/program.api';
import {
  createEllenorzoLista,
  listEllenorzoLista,
} from '../../features/ellenorzo-lista/ellenorzo-lista.api';
import {
  createListaElem,
  deleteListaElem,
  updateListaElem,
} from '../../features/lista-elem/lista-elem.api';

// --- Típusok ---
type EventItem = {
  id: number;
  dayId: number;
  timeStart: string;
  timeEnd: string;
  title: string;
};

const DEFAULT_TRIP_TITLE = "Párizsi kirándulás";

// --- Stílus Konstansok ---
const glassStyleCommon = {
  bg: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  borderRadius: "20px",
};

const glassButtonStyle = {
  bg: "rgba(255, 255, 255, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white",
  _hover: { bg: "rgba(255, 255, 255, 0.25)" },
  backdropFilter: "blur(5px)",
};

const whiteCardStyle = {
  bg: "#F7FAFC",
  borderRadius: "xl",
  boxShadow: "sm",
  color: "#2D3748",
  p: 4,
  width: "100%",
};

// --- Segédfüggvények ---
const parseMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDuration = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} óra ${minutes} perc`;
  if (hours > 0) return `${hours} óra`;
  return `${minutes} perc`;
};

const parseDateOnly = (dateStr: string) => {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateOnly = (date: Date) => date.toISOString().slice(0, 10);

const calcDayCount = (start: string, end: string): number => {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  if (!startDate || !endDate) {
    return 0;
  }
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

const addDays = (start: string, days: number) => {
  const d = parseDateOnly(start);
  if (!d) return start;
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateOnly(d);
};

const clampDay = (day: number, max: number) => {
  if (max <= 0) return 1;
  return Math.min(Math.max(day, 1), max);
};

const UtReszletekOldal: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  const checklistModal = useDisclosure();

  const [tripTitle, setTripTitle] = useState(DEFAULT_TRIP_TITLE);
  const [tripStart, setTripStart] = useState<string | null>(null);
  const [tripEnd, setTripEnd] = useState<string | null>(null);

  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<number[]>([]); 
  const [events, setEvents] = useState<EventItem[]>([]);
  const [checklist, setChecklist] = useState<
    { id: number; text: string; checked: boolean }[]
  >([]);
  const [activeListaId, setActiveListaId] = useState<number | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const daysScrollRef = useRef<HTMLDivElement | null>(null);

  const handleToggleCheck = async (id: number) => {
    const current = checklist.find((item) => item.id === id);
    if (!current || !activeListaId) return;
    const nextChecked = !current.checked;
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: nextChecked } : item)),
    );
    try {
      await updateListaElem(id, { kipipalva: nextChecked });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      setChecklist((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked: current.checked } : item)),
      );
      toast({
        title: "Nem sikerült frissíteni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBack = () => {
    navigate('/utazastervezo');
  };

  const handleAddDay = async () => {
    if (!tripStart || !tripEnd || !id) return;
    const utazasId = Number(id);
    if (Number.isNaN(utazasId)) return;
    const nextEnd = addDays(tripEnd, 1);
    try {
      await updateUtazas(utazasId, { veg_datum: nextEnd });
      await loadTrip(utazasId);
      toast({ title: `Új nap hozzáadva`, status: "success", duration: 2000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült hozzáadni a napot",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDaysFrom = async (day: number) => {
    if (!tripStart || !id) return;
    const utazasId = Number(id);
    if (Number.isNaN(utazasId)) return;
    if (day <= 1) {
      toast({ title: "Legalább 1 napnak maradnia kell", status: "warning", duration: 2000 });
      return;
    }

    const nextEnd = addDays(tripStart, day - 2);
    const programsToDelete = events.filter((event) => event.dayId >= day);
    if (programsToDelete.length > 0) {
      const results = await Promise.allSettled(
        programsToDelete.map((event) => deleteProgram(event.id)),
      );
      const failedCount = results.filter((res) => res.status === "rejected").length;
      if (failedCount > 0) {
        toast({
          title: "Nem sikerült minden eseményt törölni",
          description: "Lehet, hogy néhány régi esemény később visszajön.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setEvents((prev) => prev.filter((event) => event.dayId < day));
      }
    }
    try {
      await updateUtazas(utazasId, { veg_datum: nextEnd });
      setTripEnd(nextEnd);
      const nextCount = calcDayCount(tripStart, nextEnd);
      const safeCount = nextCount > 0 ? nextCount : 1;
      setDays(Array.from({ length: safeCount }, (_, idx) => idx + 1));
      setActiveDay((prev) => clampDay(prev, safeCount));
      await loadTrip(utazasId);
      toast({ title: "Napok törölve", status: "success", duration: 2000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült törölni a napokat",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenNewEvent = () => {
    setEditingEventId(null);
    setNewEventTitle("");
    setNewEventStart("");
    setNewEventEnd("");
    onOpen();
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventStart(event.timeStart);
    setNewEventEnd(event.timeEnd);
    onOpen();
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!id) return;
    const utazasId = Number(id);
    if (Number.isNaN(utazasId)) return;
    try {
      await deleteProgram(eventId);
      await loadTrip(utazasId);
      toast({ title: "Esemény törölve", status: "success", duration: 1500 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült törölni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !newEventStart) {
      toast({ title: "Töltsd ki a mezőket!", status: "warning" });
      return;
    }
    if (!id) {
      toast({ title: "Hiányzó utazás adat", status: "warning" });
      return;
    }
    const utazasId = Number(id);
    if (Number.isNaN(utazasId)) return;

    try {
      const safeEnd = newEventEnd || newEventStart;
      if (editingEventId) {
        await updateProgram(editingEventId, {
          nev: newEventTitle.trim(),
          kezdo_ido: newEventStart,
          veg_ido: safeEnd,
        });
      } else {
        if (!tripStart) {
          toast({ title: "Hiányzó utazás adat", status: "warning" });
          return;
        }
        const napDatum = addDays(tripStart, activeDay - 1);
        await createProgram(utazasId, {
          nev: newEventTitle.trim(),
          nap_datum: napDatum,
          kezdo_ido: newEventStart,
          veg_ido: safeEnd,
        });
      }
      await loadTrip(utazasId);
      onClose();
      setNewEventTitle("");
      setNewEventStart("");
      setNewEventEnd("");
      setEditingEventId(null);
      toast({
        title: editingEventId ? "Esemény frissítve" : "Esemény hozzáadva",
        status: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: editingEventId ? "Nem sikerült frissíteni az eseményt" : "Nem sikerült hozzáadni az eseményt",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleAddChecklistItem = () => {
    setNewItemName("");
    checklistModal.onOpen();
  };

  const confirmAddChecklistItem = async () => {
    if (!id) return;
    const utazasId = Number(id);
    if (Number.isNaN(utazasId)) return;
    const name = newItemName.trim();
    if (!name) {
      toast({ title: "Adj meg egy nevet!", status: "warning", duration: 2000 });
      return;
    }

    try {
      let listaId = activeListaId;
      if (!listaId) {
        const created = await createEllenorzoLista(utazasId, {
          lista_nev: "Ellenőrzőlista",
        });
        listaId = created.lista_id;
        setActiveListaId(listaId);
      }
      const createdItem = await createListaElem(listaId, {
        megnevezes: name,
      });
      setChecklist((prev) => [
        ...prev,
        { id: createdItem.elem_id, text: createdItem.megnevezes, checked: false },
      ]);
      checklistModal.onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült hozzáadni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteChecked = async () => {
    if (!activeListaId) {
      toast({ title: "Nincs ellenőrzőlista", status: "warning", duration: 2000 });
      return;
    }
    const toDelete = checklist.filter((item) => item.checked);
    if (toDelete.length === 0) {
      toast({ title: "Nincs kijelölt elem", status: "warning", duration: 1000 });
      return;
    }
    try {
      await Promise.all(toDelete.map((item) => deleteListaElem(item.id)));
      setChecklist((prev) => prev.filter((item) => !item.checked));
      toast({ title: "Kijelölt elemek törölve", status: "success", duration: 1000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült törölni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadTrip = async (utazasId: number) => {
    const res = await getUtazas(utazasId);
    setTripTitle(res.cim || DEFAULT_TRIP_TITLE);
    setTripStart(res.kezdo_datum);
    setTripEnd(res.veg_datum);
    const dayCount = calcDayCount(res.kezdo_datum, res.veg_datum);
    const safeDayCount = dayCount > 0 ? dayCount : 1;
    const dayList = Array.from({ length: safeDayCount }, (_, idx) => idx + 1);
    setDays(dayList);
    setActiveDay((prev) => clampDay(prev, safeDayCount));

    const baseDate = res.kezdo_datum;
    const base = parseDateOnly(baseDate);
    const mappedEvents: EventItem[] = res.programok.map((program) => {
      const napDatum = program.nap_datum ?? baseDate;
      const nap = parseDateOnly(napDatum);
      const dayId =
        base && nap
          ? Math.floor((nap.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 1;
      return {
        id: program.azonosito,
        dayId,
        timeStart: program.kezdo_ido,
        timeEnd: program.veg_ido,
        title: program.nev,
      };
    });
    setEvents(mappedEvents);
  };

  const loadChecklist = async (utazasId: number) => {
    const res = await listEllenorzoLista(utazasId);
    const lista = res.ellenorzolistak[0];
    if (!lista) {
      setChecklist([]);
      setActiveListaId(null);
      return;
    }
    setActiveListaId(lista.lista_id);
    setChecklist(
      lista.elemek.map((elem) => ({
        id: elem.elem_id,
        text: elem.megnevezes,
        checked: elem.kipipalva,
      })),
    );
  };

  useEffect(() => {
    if (!id) return;
    const utazasId = Number(id);
    if (Number.isNaN(utazasId)) return;
    const load = async () => {
      try {
        await Promise.all([loadTrip(utazasId), loadChecklist(utazasId)]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
        toast({
          title: "Nem sikerült betölteni az utazást",
          description: msg,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };
    void load();
  }, [id, toast]);

  useEffect(() => {
    if (days.length > 0 || !tripStart || !tripEnd) return;
    const nextCount = calcDayCount(tripStart, tripEnd);
    const safeCount = nextCount > 0 ? nextCount : 1;
    setDays(Array.from({ length: safeCount }, (_, idx) => idx + 1));
    setActiveDay((prev) => clampDay(prev, safeCount));
  }, [days.length, tripStart, tripEnd]);

  const displayDays = useMemo(() => {
    if (days.length > 0) return days;
    if (!tripStart || !tripEnd) return [];
    const count = calcDayCount(tripStart, tripEnd);
    const safeCount = count > 0 ? count : 1;
    return Array.from({ length: safeCount }, (_, idx) => idx + 1);
  }, [days, tripStart, tripEnd]);

  useEffect(() => {
    const container = daysScrollRef.current;
    if (!container) return;
    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-day="${activeDay}"]`,
    );
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeDay, displayDays.length]);

  const sortedEvents = useMemo(() => {
    return events
      .filter(e => e.dayId === activeDay)
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }, [events, activeDay]);

  const totalDurationString = useMemo(() => {
    let totalMinutes = 0;
    sortedEvents.forEach(event => {
      const start = parseMinutes(event.timeStart);
      const end = parseMinutes(event.timeEnd);
      if (end > start) {
        totalMinutes += (end - start);
      } else if (end < start) {
        // Éjfél átlógás: pl. 23:00 -> 01:00 = 2 óra
        totalMinutes += (24 * 60 - start) + end;
      }
    });
    return totalMinutes > 0 ? formatDuration(totalMinutes) : "0 perc";
  }, [sortedEvents]);

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
      <Container maxW="1200px">
        
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10} alignItems="start">
          
          {/* === BAL OSZLOP === */}
          <GridItem>
            <VStack align="start" spacing={6} w="100%">
              <Heading size="3xl" fontWeight="700">{tripTitle}</Heading>
              
              <Box
                ref={daysScrollRef}
                bg="rgba(255,255,255,0.15)"
                borderRadius="lg"
                p={1}
                backdropFilter="blur(5px)"
                overflowX="auto"
                overflowY="hidden"
                maxW={{ base: "100%", md: "620px" }}
                sx={{
                  '&::-webkit-scrollbar': { height: '6px' },
                  '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '6px' },
                }}
              >
                <HStack spacing={0} flexWrap="nowrap">
                  {displayDays.map(day => (
                    <Button
                      key={day}
                      data-day={day}
                      onClick={() => setActiveDay(day)}
                      bg={activeDay === day ? "#3B49DF" : "transparent"}
                      color="white"
                      borderRadius="md"
                      size="sm"
                      px={6}
                      flexShrink={0}
                      _hover={{ bg: activeDay === day ? "#2b36a8" : "rgba(255,255,255,0.1)" }}
                      fontWeight="500"
                    >
                      {day}. nap
                    </Button>
                  ))}
                  <IconButton
                    aria-label="Utolsó nap törlése"
                    icon={<DeleteIcon boxSize={3} />}
                    variant="outline"
                    size="sm"
                    color="white"
                    borderColor="rgba(255,255,255,0.5)"
                    bg="rgba(255,255,255,0.12)"
                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                    flexShrink={0}
                    isDisabled={displayDays.length <= 1}
                    onClick={() => void handleDeleteDaysFrom(displayDays.length)}
                    ml={2}
                  />
                </HStack>
              </Box>

              <HStack spacing={4} w="100%" wrap="wrap" mb={4}>
                <Button {...glassButtonStyle} width="180px" borderRadius="lg" fontWeight="400" onClick={handleBack}>Visszalépés</Button>
                <Button bg="#1E2A4F" color="white" borderRadius="lg" leftIcon={<AddIcon fontSize="xs" />} _hover={{ bg: "#151d36" }} px={6} onClick={handleAddDay}>új nap hozzáadása</Button>
                <Button bg="#3B49DF" color="white" borderRadius="lg" leftIcon={<AddIcon fontSize="xs" />} rightIcon={<ChevronDownIcon />} _hover={{ bg: "#2b36a8" }} px={6} onClick={handleOpenNewEvent}>új program</Button>
              </HStack>

              <Box 
                position="relative" 
                w="100%" 
                maxH={{ base: "420px", md: "520px", lg: "calc(100vh - 360px)" }}
                overflowY="auto"
                overscrollBehavior="contain"
                pr={2}
                pl={2}
                sx={{
                  '&::-webkit-scrollbar': { width: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px', border: '2px solid transparent', backgroundClip: 'content-box' },
                  '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
                }}
              >
                <Box position="absolute" left="75px" top="0" bottom="0" w="2px" bg="rgba(255,255,255,0.3)" zIndex={0} minH="100%" />

                <VStack spacing={6} align="stretch" position="relative" zIndex={1} pb={10}>
                  {sortedEvents.length === 0 && <Text ml={24} pt={4}>Erre a napra még nincs programod.</Text>}
                  
                  {sortedEvents.map((event) => (
                    <Flex key={event.id} align="flex-start" position="relative">
                      <Text w="60px" fontSize="xs" fontWeight="600" mt={4} opacity={0.7} textAlign="right" mr={6}>
                        {event.timeStart}
                      </Text>
                      <Box position="absolute" left="71px" top="22px" w="10px" h="10px" bg="rgba(255,255,255,0.5)" borderRadius="full" />
                      <Box {...whiteCardStyle} minH="80px">
                        <Heading size="md" mb={1} color="#1E2A4F">{event.title}</Heading>
                        <Text fontSize="sm" color="gray.500">{event.timeStart} - {event.timeEnd}</Text>
                        <HStack spacing={2} mt={3}>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<EditIcon />}
                            onClick={() => handleEditEvent(event)}
                          >
                            Szerkesztés
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="red"
                            leftIcon={<DeleteIcon />}
                            onClick={() => void handleDeleteEvent(event.id)}
                          >
                            Törlés
                          </Button>
                        </HStack>
                        <Box h="1px" bg="gray.300" mt={6} w="100%" />
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              </Box>

            </VStack>
          </GridItem>

          {/* === JOBB OSZLOP === */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              
              {/* Időtartam kártya (MOST MÁR GLASSMORPHISM HÁTTÉRREL) */}
              <Box {...glassStyleCommon} p={6}>
                {/* Fehér belső kártya */}
                <Box bg="#F7FAFC" borderRadius="xl" p={6} color="#2D3748" boxShadow="sm">
                  <Heading size="sm" color="#1E2A4F" mb={2}>Időtartam összesen</Heading>
                  <Text fontSize="md" color="gray.500" mb={4}>{totalDurationString}</Text>
                  <Divider borderColor="gray.300" mb={4} />
                  <Text fontSize="sm" color="gray.500">Tervek</Text>
                  <Text fontSize="lg" fontWeight="600" color="#1E2A4F">{sortedEvents.length} elem</Text>
                </Box>
              </Box>

              {/* Ellenőrzőlista */}
              <Box {...glassStyleCommon} p={6}>
                <Heading size="lg" mb={4} textAlign="center" color="white">Ellenőrzőlista</Heading>
                <HStack mb={6} justify="center" spacing={3}>
                  <Button
                    size="xs"
                    bg="white"
                    color="black"
                    borderRadius="full"
                    px={4}
                    _hover={{ bg: "gray.100" }}
                    onClick={handleAddChecklistItem}
                  >
                    Hozzáadás
                  </Button>
                  <Button
                    size="xs"
                    bg="white"
                    color="black"
                    borderRadius="full"
                    px={4}
                    _hover={{ bg: "gray.100" }}
                    onClick={handleDeleteChecked}
                  >
                    Törlés
                  </Button>
                </HStack>
                <VStack align="stretch" spacing={3}>
                  {checklist.length === 0 && (
                    <Text textAlign="center" color="white" opacity={0.6} fontSize="sm">
                      Nincs még elem. Adj hozzá egyet!
                    </Text>
                  )}
                  {checklist.map((item) => (
                    <HStack key={item.id} spacing={3} onClick={() => handleToggleCheck(item.id)} cursor="pointer">
                      <Box w="24px" h="24px" borderRadius="6px" bg="#1E2A4F" display="flex" alignItems="center" justifyContent="center" flexShrink={0} border={item.checked ? "none" : "1px solid rgba(255,255,255,0.3)"}>
                        {item.checked && <Icon as={CheckIcon} color="white" w={3} h={3} />}
                      </Box>
                      <Text fontSize="lg" color="#1E2A4F" fontWeight="500" textDecoration={item.checked ? "line-through" : "none"} opacity={item.checked ? 0.6 : 1}>{item.text}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </GridItem>

        </Grid>
      </Container>

      {/* --- MODAL --- */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>{editingEventId ? "Program szerkesztése" : "Új program"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Cím</FormLabel><Input value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} /></FormControl>
              <HStack w="100%">
                <FormControl><FormLabel>Kezdés</FormLabel><Input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} /></FormControl>
                <FormControl><FormLabel>Vég</FormLabel><Input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} /></FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Mégse</Button>
            <Button colorScheme="blue" onClick={() => void handleSaveEvent()}>
              {editingEventId ? "Mentés" : "Hozzáadás"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={checklistModal.isOpen} onClose={checklistModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="rgba(255,0,0,0.15)" />
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
              onKeyDown={(e) => { if (e.key === 'Enter') void confirmAddChecklistItem(); }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={checklistModal.onClose}>Mégse</Button>
            <Button bg="#232B5C" color="white" _hover={{ bg: "#1a214d" }} onClick={() => void confirmAddChecklistItem()}>Hozzáadás</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default UtReszletekOldal;
