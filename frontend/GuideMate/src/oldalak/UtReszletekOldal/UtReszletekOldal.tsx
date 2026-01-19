import React, { useState, useMemo } from 'react';
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
  Badge,
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
import { AddIcon, ArrowBackIcon, ChevronDownIcon, CheckIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';

// --- Típusok ---
type EventItem = {
  id: number;
  dayId: number;
  timeStart: string;
  timeEnd: string;
  title: string;
};

// --- Mock Adatok ---
const initialEvents: EventItem[] = [
  { id: 1, dayId: 1, timeStart: "09:00", timeEnd: "10:30", title: "Eiffel-torony" },
  { id: 2, dayId: 1, timeStart: "11:00", timeEnd: "11:30", title: "Café de Flore" },
  { id: 3, dayId: 1, timeStart: "12:30", timeEnd: "14:00", title: "Louvre" },
  { id: 4, dayId: 1, timeStart: "15:00", timeEnd: "16:30", title: "Montmartre séta" },
  { id: 5, dayId: 1, timeStart: "18:00", timeEnd: "20:00", title: "Vacsora a Szajnán" },
];

const checklistMock = [
  { id: 1, text: "Útlevél", checked: true },
  { id: 2, text: "Hátizsák", checked: true },
  { id: 3, text: "Szemüveg", checked: true },
  { id: 4, text: "Pénztárca", checked: true },
  { id: 5, text: "Víz", checked: false },
  { id: 6, text: "Sapka", checked: false },
];

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

const UtReszletekOldal: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); 

  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState([1, 2, 3]); 
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [checklist, setChecklist] = useState(checklistMock);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");

  const handleToggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleBack = () => {
    navigate('/utazastervezo');
  };

  const handleAddDay = () => {
    const newDay = days.length + 1;
    setDays([...days, newDay]);
    toast({ title: `${newDay}. nap hozzáadva`, status: "success", duration: 2000 });
  };

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventStart) {
      toast({ title: "Töltsd ki a mezőket!", status: "warning" });
      return;
    }
    const newEvent: EventItem = {
      id: Date.now(),
      dayId: activeDay,
      timeStart: newEventStart,
      timeEnd: newEventEnd || newEventStart,
      title: newEventTitle,
    };
    setEvents([...events, newEvent]);
    onClose();
    setNewEventTitle("");
    setNewEventStart("");
    setNewEventEnd("");
    toast({ title: "Esemény hozzáadva", status: "success" });
  };

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
              <Heading size="3xl" fontWeight="700">Párizsi kirándulás</Heading>
              
              <HStack spacing={0} bg="rgba(255,255,255,0.15)" borderRadius="lg" p={1} backdropFilter="blur(5px)">
                {days.map(day => (
                  <Button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    bg={activeDay === day ? "#3B49DF" : "transparent"}
                    color="white"
                    borderRadius="md"
                    size="sm"
                    px={6}
                    _hover={{ bg: activeDay === day ? "#2b36a8" : "rgba(255,255,255,0.1)" }}
                    fontWeight="500"
                  >
                    {day}. nap
                  </Button>
                ))}
                <IconButton aria-label="Opciók" icon={<Box w="2px" h="10px" borderLeft="2px dotted white" />} variant="ghost" size="sm" color="white" _hover={{ bg: "transparent" }} />
              </HStack>

              <HStack spacing={4} w="100%" wrap="wrap" mb={4}>
                <Button {...glassButtonStyle} width="180px" borderRadius="lg" fontWeight="400" onClick={handleBack}>Visszalépés</Button>
                <Button bg="#1E2A4F" color="white" borderRadius="lg" leftIcon={<AddIcon fontSize="xs" />} _hover={{ bg: "#151d36" }} px={6} onClick={handleAddDay}>új nap hozzáadása</Button>
                <Button bg="#3B49DF" color="white" borderRadius="lg" leftIcon={<AddIcon fontSize="xs" />} rightIcon={<ChevronDownIcon />} _hover={{ bg: "#2b36a8" }} px={6} onClick={onOpen}>új esemény</Button>
              </HStack>

              <Box 
                position="relative" 
                w="100%" 
                maxH="600px" 
                overflowY="auto"
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
                  {sortedEvents.length === 0 && <Text ml={24} pt={4}>Nincs esemény.</Text>}
                  
                  {sortedEvents.map((event) => (
                    <Flex key={event.id} align="flex-start" position="relative">
                      <Text w="60px" fontSize="xs" fontWeight="600" mt={4} opacity={0.7} textAlign="right" mr={6}>
                        {event.timeStart}
                      </Text>
                      <Box position="absolute" left="71px" top="22px" w="10px" h="10px" bg="rgba(255,255,255,0.5)" borderRadius="full" />
                      <Box {...whiteCardStyle} minH="80px">
                        <Heading size="md" mb={1} color="#1E2A4F">{event.title}</Heading>
                        <Text fontSize="sm" color="gray.500">{event.timeStart} - {event.timeEnd}</Text>
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
                  <Button size="xs" bg="white" color="black" borderRadius="full" px={4} _hover={{ bg: "gray.100" }}>Hozzáadás</Button>
                  <Button size="xs" bg="white" color="black" borderRadius="full" px={4} _hover={{ bg: "gray.100" }}>Törlés</Button>
                </HStack>
                <VStack align="stretch" spacing={3}>
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
          <ModalHeader>Új esemény</ModalHeader>
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
            <Button colorScheme="blue" onClick={handleAddEvent}>Mentés</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default UtReszletekOldal;