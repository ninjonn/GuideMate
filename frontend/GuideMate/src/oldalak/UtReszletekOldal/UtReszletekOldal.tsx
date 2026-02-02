import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
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
  Textarea,
  Stack,
  useBreakpointValue,
  Flex,
  Icon,
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
  description?: string | null;
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
  if (!startDate || !endDate) return 0;
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
  
  // Modals
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  const checklistAddModal = useDisclosure(); // Új elem hozzáadása
  const mobileChecklistModal = useDisclosure(); // Mobil nézetben a lista megjelenítése
  
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const [tripTitle, setTripTitle] = useState(DEFAULT_TRIP_TITLE);
  const [tripStart, setTripStart] = useState<string | null>(null);
  const [tripEnd, setTripEnd] = useState<string | null>(null);

  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<number[]>([]); 
  const [events, setEvents] = useState<EventItem[]>([]);
  const [checklist, setChecklist] = useState<{ id: number; text: string; checked: boolean }[]>([]);
  const [activeListaId, setActiveListaId] = useState<number | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const daysScrollRef = useRef<HTMLDivElement | null>(null);

  // --- Handlerek ---
  const handleToggleCheck = async (id: number) => {
    const current = checklist.find((item) => item.id === id);
    if (!current || !activeListaId) return;
    const nextChecked = !current.checked;
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, checked: nextChecked } : item)));
    try { await updateListaElem(id, { kipipalva: nextChecked }); } 
    catch (err) { setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, checked: current.checked } : item))); }
  };

  const handleBack = () => { navigate('/utazastervezo'); };

  const handleAddDay = async () => {
    if (!tripStart || !tripEnd || !id) return;
    const utazasId = Number(id);
    const nextEnd = addDays(tripEnd, 1);
    try {
      await updateUtazas(utazasId, { veg_datum: nextEnd });
      await loadTrip(utazasId);
      toast({ title: `Új nap hozzáadva`, status: "success" });
    } catch (err) { toast({ title: "Hiba", status: "error" }); }
  };

  const handleDeleteDaysFrom = async (day: number) => {
    if (!tripStart || !id) return;
    const utazasId = Number(id);
    if (day <= 1) return;
    const nextEnd = addDays(tripStart, day - 2);
    const programsToDelete = events.filter((event) => event.dayId >= day);
    if (programsToDelete.length > 0) {
      await Promise.allSettled(programsToDelete.map((event) => deleteProgram(event.id)));
      setEvents((prev) => prev.filter((event) => event.dayId < day));
    }
    try {
      await updateUtazas(utazasId, { veg_datum: nextEnd });
      setTripEnd(nextEnd);
      await loadTrip(utazasId);
      toast({ title: "Napok törölve", status: "success" });
    } catch (err) { toast({ title: "Hiba", status: "error" }); }
  };

  const handleOpenNewEvent = () => { setEditingEventId(null); setNewEventTitle(""); setNewEventStart(""); setNewEventEnd(""); setNewEventDescription(""); onOpen(); };
  const handleEditEvent = (event: EventItem) => { setEditingEventId(event.id); setNewEventTitle(event.title); setNewEventStart(event.timeStart); setNewEventEnd(event.timeEnd); setNewEventDescription(event.description ?? ""); onOpen(); };
  
  const handleDeleteEvent = async (eventId: number) => {
    if (!id) return;
    try { await deleteProgram(eventId); await loadTrip(Number(id)); toast({ title: "Törölve", status: "success" }); } 
    catch (err) { toast({ title: "Hiba", status: "error" }); }
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !newEventStart) { toast({ title: "Hiányzó adatok", status: "warning" }); return; }
    if (!id || !tripStart) return;
    try {
      const safeEnd = newEventEnd || newEventStart;
      if (editingEventId) {
        await updateProgram(editingEventId, { nev: newEventTitle.trim(), leiras: newEventDescription.trim() ? newEventDescription.trim() : undefined, kezdo_ido: newEventStart, veg_ido: safeEnd });
      } else {
        const napDatum = addDays(tripStart, activeDay - 1);
        await createProgram(Number(id), { nev: newEventTitle.trim(), leiras: newEventDescription.trim() ? newEventDescription.trim() : undefined, nap_datum: napDatum, kezdo_ido: newEventStart, veg_ido: safeEnd });
      }
      await loadTrip(Number(id));
      onClose();
      setNewEventDescription("");
      toast({ title: "Siker", status: "success" });
    } catch (err) { toast({ title: "Hiba", status: "error" }); }
  };

  const handleAddChecklistItem = () => { setNewItemName(""); checklistAddModal.onOpen(); };
  const confirmAddChecklistItem = async () => {
    if (!id) return;
    const name = newItemName.trim();
    if (!name) return;
    try {
      let listaId = activeListaId;
      if (!listaId) {
        const created = await createEllenorzoLista(Number(id), { lista_nev: "Ellenőrzőlista" });
        listaId = created.lista_id;
        setActiveListaId(listaId);
      }
      const createdItem = await createListaElem(listaId!, { megnevezes: name });
      setChecklist((prev) => [...prev, { id: createdItem.elem_id, text: createdItem.megnevezes, checked: false }]);
      checklistAddModal.onClose();
    } catch (err) { toast({ title: "Hiba", status: "error" }); }
  };

  const handleDeleteChecked = async () => {
    if (!activeListaId) return;
    const toDelete = checklist.filter((item) => item.checked);
    if (toDelete.length === 0) return;
    try {
      await Promise.all(toDelete.map((item) => deleteListaElem(item.id)));
      setChecklist((prev) => prev.filter((item) => !item.checked));
      toast({ title: "Törölve", status: "success" });
    } catch (err) { toast({ title: "Hiba", status: "error" }); }
  };

  const loadTrip = async (utazasId: number) => {
    const res = await getUtazas(utazasId);
    setTripTitle(res.cim || DEFAULT_TRIP_TITLE);
    setTripStart(res.kezdo_datum);
    setTripEnd(res.veg_datum);
    const dayCount = calcDayCount(res.kezdo_datum, res.veg_datum);
    const safeDayCount = dayCount > 0 ? dayCount : 1;
    setDays(Array.from({ length: safeDayCount }, (_, idx) => idx + 1));
    setActiveDay((prev) => clampDay(prev, safeDayCount));

    const baseDate = res.kezdo_datum;
    const base = parseDateOnly(baseDate);
    const mappedEvents: EventItem[] = res.programok.map((program) => {
      const napDatum = program.nap_datum ?? baseDate;
      const nap = parseDateOnly(napDatum);
      const dayId = base && nap ? Math.floor((nap.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1;
      return { id: program.azonosito, dayId, timeStart: program.kezdo_ido, timeEnd: program.veg_ido, title: program.nev, description: program.leiras };
    });
    setEvents(mappedEvents);
  };

  const loadChecklist = async (utazasId: number) => {
    try {
      const res = await listEllenorzoLista(utazasId);
      const lista = res.ellenorzolistak[0];
      if (lista) {
        setActiveListaId(lista.lista_id);
        setChecklist(lista.elemek.map((elem) => ({ id: elem.elem_id, text: elem.megnevezes, checked: elem.kipipalva })));
      }
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      void loadTrip(Number(id));
      void loadChecklist(Number(id));
    }
  }, [id]);

  useEffect(() => {
    const container = daysScrollRef.current;
    if (!container) return;
    const activeButton = container.querySelector<HTMLButtonElement>(`[data-day="${activeDay}"]`);
    if (activeButton) activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeDay, days.length]);

  const sortedEvents = useMemo(() => {
    return events.filter(e => e.dayId === activeDay).sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }, [events, activeDay]);

  const totalDurationString = useMemo(() => {
    let totalMinutes = 0;
    sortedEvents.forEach(event => {
      const start = parseMinutes(event.timeStart);
      const end = parseMinutes(event.timeEnd);
      if (end > start) totalMinutes += (end - start);
      else if (end < start) totalMinutes += (24 * 60 - start) + end;
    });
    return totalMinutes > 0 ? formatDuration(totalMinutes) : "0 perc";
  }, [sortedEvents]);

  // --- RENDERELÉS ---
  
  // Közös Checklist Komponens (hogy ne kelljen duplikálni)
  const ChecklistContent = ({ isMobileView = false }) => (
    <VStack align="stretch" spacing={3} w="100%">
      <HStack mb={4} justify="center" spacing={3}>
        <Button size="xs" bg="white" color="black" borderRadius="full" px={4} onClick={handleAddChecklistItem}>Hozzáadás</Button>
        <Button size="xs" bg="white" color="black" borderRadius="full" px={4} onClick={handleDeleteChecked}>Törlés</Button>
      </HStack>
      {checklist.length === 0 && <Text textAlign="center" opacity={0.6} fontSize="sm">Nincs elem.</Text>}
      {checklist.map((item) => (
        <HStack key={item.id} spacing={3} onClick={() => handleToggleCheck(item.id)} cursor="pointer">
          <Box 
            w="24px" h="24px" 
            borderRadius="6px" 
            bg="#1E2A4F" 
            display="flex" alignItems="center" justifyContent="center" flexShrink={0} 
            border={item.checked ? "none" : `1px solid ${isMobileView ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)"}`}
          >
            {item.checked && <Icon as={CheckIcon} color="white" w={3} h={3} />}
          </Box>
          <Text fontSize="lg" color="#1E2A4F" fontWeight="500" textDecoration={item.checked ? "line-through" : "none"} opacity={item.checked ? 0.6 : 1}>
            {item.text}
          </Text>
        </HStack>
      ))}
    </VStack>
  );

  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      pt={{ base: 20, md: 32 }}
      pb={10}
      overflowX="hidden"
    >
      <Container maxW="1200px" px={{ base: 4, md: 8 }}>
        
        <Flex direction={{ base: "column", lg: "row" }} gap={10} align="flex-start">
          
          {/* === BAL OSZLOP (Timeline + Gombok) === */}
          <Box flex="2" w="100%">
            <VStack align="start" spacing={6} w="100%">
              <Heading size={{ base: "xl", md: "3xl" }} fontWeight="700" textAlign={{ base: "center", md: "left" }} w="100%">
                {tripTitle}
              </Heading>
              
              <Box
                ref={daysScrollRef}
                bg="rgba(255,255,255,0.15)"
                borderRadius="lg"
                p={1}
                backdropFilter="blur(5px)"
                overflowX="auto"
                overflowY="hidden"
                w={{ base: "100%", md: "560px" }}
                maxW="100%"
                whiteSpace="nowrap"
                scrollbarWidth="auto"
                sx={{
                  '&::-webkit-scrollbar': { height: '6px' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.4)', borderRadius: '999px' },
                  '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
                }}
              >
                <HStack spacing={0} flexWrap="nowrap" minW="max-content">
                  {days.map(day => (
                    <Button
                      key={day}
                      data-day={day}
                      onClick={() => setActiveDay(day)}
                      bg={activeDay === day ? "#3B49DF" : "transparent"}
                      color="white"
                      borderRadius="md"
                      size="sm"
                      px={6}
                      minW="72px"
                      flexShrink={0}
                      _hover={{ bg: activeDay === day ? "#2b36a8" : "rgba(255,255,255,0.1)" }}
                      fontWeight="500"
                    >
                      {day}. nap
                    </Button>
                  ))}
                  <IconButton aria-label="Törlés" icon={<DeleteIcon boxSize={3} />} size="xs" variant="ghost" color="white" onClick={() => void handleDeleteDaysFrom(days.length)} ml={2} />
                </HStack>
              </Box>

              {/* IDŐTARTAM KÁRTYA (MOBIL NÉZETBEN) */}
              <Box 
                display={{ base: "block", lg: "none" }} 
                bg="white" 
                borderRadius="xl" 
                p={4} 
                color="#2D3748" 
                boxShadow="lg" 
                w="100%" 
                textAlign="center"
              >
                <Heading size="xs" color="#1E2A4F" mb={1} textTransform="uppercase">Időtartam összesen</Heading>
                <Text fontSize="xl" fontWeight="bold" mb={2}>{totalDurationString}</Text>
                <Divider mb={2} />
                <Text fontSize="xs" color="gray.500">Tervek: <Text as="span" fontWeight="bold" color="#1E2A4F">{sortedEvents.length} elem</Text></Text>
              </Box>

              <Stack
                spacing={3}
                w="100%"
                mb={4}
                direction={{ base: "column", md: "row" }}
              >
                <Button {...glassButtonStyle} w={{ base: "100%", md: "180px" }} onClick={handleBack}>Visszalépés</Button>
                <Button bg="#1E2A4F" color="white" w={{ base: "100%", md: "auto" }} _hover={{ bg: "#151d36" }} onClick={handleAddDay} px={6}>+ új nap hozzáadása</Button>
                <Button bg="#3B49DF" color="white" w={{ base: "100%", md: "auto" }} _hover={{ bg: "#2b36a8" }} onClick={handleOpenNewEvent} rightIcon={<ChevronDownIcon />} px={6}>+ új esemény</Button>
              </Stack>

              <Box position="relative" w="100%">
                <Box
                  position="relative"
                  maxH={{ base: "520px", md: "640px", lg: "680px" }}
                  overflowY="auto"
                  pr={2}
                  pb={2}
                  scrollbarWidth="thin"
                  sx={{
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.35)', borderRadius: '999px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.12)' },
                  }}
                >
                  <Box position="relative" minH="100%">
                    {/* Vonal csak desktopon */}
                    <Box 
                      display={{ base: "none", md: "block" }} 
                      position="absolute" left="75px" top="0" bottom="0" w="3px" bg="rgba(255,255,255,0.3)" zIndex={0} 
                    />

                    <VStack spacing={{ base: 3, md: 6 }} align="stretch" position="relative" zIndex={1} pb={2}>
                      {sortedEvents.length === 0 && <Text ml={{ base: 4, md: 24 }} pt={4} fontSize="sm" opacity={0.8}>Nincs program.</Text>}
                      
                      {sortedEvents.map((event) => (
                        <Flex 
                          key={event.id} 
                          align={{ base: "stretch", md: "flex-start" }} 
                          direction={{ base: "column", md: "row" }}
                          position="relative"
                          mb={{ base: 2, md: 0 }}
                        >
                          <Text 
                            w={{ base: "auto", md: "60px" }} 
                            fontSize={{ base: "sm", md: "xs" }} 
                            fontWeight="600" 
                            mt={{ base: 0, md: 4 }} 
                            mb={{ base: 1, md: 0 }}
                            opacity={0.8} 
                            textAlign={{ base: "left", md: "right" }} 
                            mr={{ base: 0, md: 8 }}
                          >
                            {event.timeStart}
                          </Text>

                          <Box 
                            display={{ base: "none", md: "block" }}
                            position="absolute" left="71px" top="22px" w="10px" h="10px" bg="rgba(255,255,255,0.5)" borderRadius="full" 
                          />

                        <Box {...whiteCardStyle} minH="80px">
                          <Heading size="md" mb={1} color="#1E2A4F">{event.title}</Heading>
                          <Text fontSize="sm" color="gray.500">{event.timeStart} - {event.timeEnd}</Text>
                          {event.description && (
                            <Text fontSize="sm" color="gray.600" mt={2} whiteSpace="pre-wrap">
                              {event.description}
                            </Text>
                          )}
                          <HStack mt={3} spacing={2} justify={{ base: "flex-end", md: "flex-start" }}>
                            <IconButton aria-label="Edit" icon={<EditIcon />} size="xs" onClick={() => handleEditEvent(event)} />
                            <IconButton aria-label="Delete" icon={<DeleteIcon />} size="xs" colorScheme="red" onClick={() => void handleDeleteEvent(event.id)} />
                          </HStack>
                            <Box h="1px" bg="gray.300" mt={6} w="100%" display={{ base: "none", md: "block" }} />
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              </Box>

            </VStack>
          </Box>

          {/* === JOBB OSZLOP (Csak Desktopon) === */}
          <Box display={{ base: "none", lg: "block" }} flex="1" w="100%">
            <VStack spacing={6} align="stretch">
              <Box {...glassStyleCommon} p={6}>
                <Box bg="#F7FAFC" borderRadius="xl" p={6} color="#2D3748" boxShadow="sm">
                  <Heading size="sm" color="#1E2A4F" mb={2}>Időtartam összesen</Heading>
                  <Text fontSize="md" color="gray.500" mb={4}>{totalDurationString}</Text>
                  <Divider borderColor="gray.300" mb={4} />
                  <Text fontSize="sm" color="gray.500">Tervek</Text>
                  <Text fontSize="lg" fontWeight="600" color="#1E2A4F">{sortedEvents.length} elem</Text>
                </Box>
              </Box>

              <Box {...glassStyleCommon} p={6} w="100%">
                <Heading size="lg" mb={4} textAlign="center" color="white">Ellenőrzőlista</Heading>
                <ChecklistContent isMobileView={false} />
              </Box>
            </VStack>
          </Box>

        </Flex>
      </Container>

      {/* --- MOBIL FAB (Floating Action Button) --- */}
      <IconButton
        aria-label="Ellenőrzőlista megnyitása"
        icon={<CheckIcon />}
        isRound
        size="lg"
        bg="#F6C95C" // Sárga szín a képről
        color="#1E2A4F"
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={100}
        shadow="xl"
        display={{ base: "flex", lg: "none" }} // Csak mobilon
        onClick={mobileChecklistModal.onOpen}
      />

      {/* --- MOBIL CHECKLIST MODAL --- */}
      <Modal isOpen={mobileChecklistModal.isOpen} onClose={mobileChecklistModal.onClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent 
          bg="#F6C95C" // Sárga háttér a modalnak is
          borderRadius="2xl" 
          boxShadow="xl"
          maxH="80vh"
          overflow="hidden"
        >
          <ModalHeader color="#1E2A4F" textAlign="center">Ellenőrzőlista</ModalHeader>
          <ModalCloseButton color="#1E2A4F" />
          <ModalBody pb={6} overflowY="auto">
             <ChecklistContent isMobileView={true} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Program Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "md" }}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>{editingEventId ? "Szerkesztés" : "Új program"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Cím</FormLabel><Input value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} /></FormControl>
              <FormControl><FormLabel>Leírás</FormLabel><Textarea value={newEventDescription} onChange={(e) => setNewEventDescription(e.target.value)} rows={3} /></FormControl>
              <HStack><FormControl><FormLabel>Kezdés</FormLabel><Input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} /></FormControl><FormControl><FormLabel>Vég</FormLabel><Input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} /></FormControl></HStack>
            </VStack>
          </ModalBody>
          <ModalFooter><Button onClick={onClose} mr={3}>Mégse</Button><Button colorScheme="blue" onClick={() => void handleSaveEvent()}>Mentés</Button></ModalFooter>
        </ModalContent>
      </Modal>

      {/* Checklist Add Modal */}
      <Modal isOpen={checklistAddModal.isOpen} onClose={checklistAddModal.onClose} isCentered size={{ base: "xs", md: "md" }}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Új elem</ModalHeader>
          <ModalBody><Input placeholder="Pl. Naptej" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} /></ModalBody>
          <ModalFooter><Button onClick={checklistAddModal.onClose} mr={3}>Mégse</Button><Button colorScheme="blue" onClick={() => void confirmAddChecklistItem()}>Hozzáadás</Button></ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default UtReszletekOldal;
