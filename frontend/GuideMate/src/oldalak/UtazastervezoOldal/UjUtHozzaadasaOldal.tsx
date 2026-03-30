import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createUtazas } from '../../features/utazas/utazas.api';
import ChakraDatePicker from '../../komponensek/ui/ChakraDatePicker';

// --- Stílus konstansok a screenshot alapján ---
const glassInputStyle = {
  bg: "rgba(255, 255, 255, 0.15)", // Áttetsző fehér háttér
  border: "1px solid rgba(255, 255, 255, 0.3)", // Vékony keret
  color: "white",
  _placeholder: { color: "rgba(255, 255, 255, 0.6)" }, // Halvány placeholder
  _focus: { 
    bg: "rgba(255, 255, 255, 0.25)", 
    borderColor: "white", 
    boxShadow: "none" 
  },
  _hover: {
    bg: "rgba(255, 255, 255, 0.2)",
  },
  borderRadius: "lg", // Lekerekített sarkok
  height: "50px",     // Magasabb mezők
  fontSize: "16px",
};

const labelStyle = {
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
  mb: 2,
  ml: 1,
};

const calcDays = (start: string, end: string): number => {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;
  const diff = Math.max(0, endMs - startMs);
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

const UjUtHozzaadasaOldal: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validáció
    if (!title || !startDate || !endDate) {
      toast({
        title: "Hiányzó adatok",
        description: "Kérlek, töltsd ki a címet és a dátumokat.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startDate > endDate) {
        toast({
            title: "Hibás dátum",
            description: "A záró dátum nem lehet korábban, mint a kezdő dátum.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });
      return;
    }

    setLoading(true);

    try {
      const formattedStart = format(startDate, "yyyy-MM-dd");
      const formattedEnd = format(endDate, "yyyy-MM-dd");

      const res = await createUtazas({
        cim: title,
        leiras: description || undefined,
        kezdo_datum: formattedStart,
        veg_datum: formattedEnd,
      });

      const ujTrip = {
        id: res.azonosito,
        title: res.cim,
        description: res.leiras ?? "",
        startDate: res.kezdo_datum,
        endDate: res.veg_datum,
        days: calcDays(res.kezdo_datum, res.veg_datum),
        programs: 0,
        checklistDone: 0,
        checklistTotal: 0,
      };

      toast({
        title: "Sikeres mentés",
        description: `"${res.cim}" létrehozva.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate('/utazastervezo', { state: { ujTrip } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Mentés sikertelen",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      // Ugyanaz a gradiens, mint a többi oldalon
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      pt={{ base: 20, md: 24 }}
    >
      <Center flex="1" px={4}>
        <VStack
          w={{ base: "100%", sm: "520px" }} // A screenshot szerinti szélesség
          spacing={6}
          p={{ base: 8, md: 10 }}
          
          // --- Glassmorphism Container ---
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(15px)"
          borderRadius="24px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.25)"
          align="stretch"
        >
          <Heading size="lg" textAlign="center" fontWeight="bold" mb={4}>
            Út hozzáadása
          </Heading>

          <VStack spacing={5}>
            <FormControl>
              <FormLabel {...labelStyle}>Cím</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pl. Párizs"
                {...glassInputStyle}
                px={4}
              />
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyle}>Leírás</FormLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pl. Louvre, Eiffel-torony..."
                {...glassInputStyle}
                px={4}
              />
            </FormControl>

            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel {...labelStyle}>Kezdő dátum</FormLabel>
                <ChakraDatePicker
                  selectedDate={startDate}
                  onChange={setStartDate}
                  showTime={false}
                  placeholder="ÉÉÉÉ. HH. NN."
                />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Záró dátum</FormLabel>
                <ChakraDatePicker
                  selectedDate={endDate}
                  onChange={setEndDate}
                  showTime={false}
                  placeholder="ÉÉÉÉ. HH. NN."
                  minDate={startDate || undefined}
                />
              </FormControl>
            </HStack>
          </VStack>

          {/* Gombok */}
          <HStack spacing={4} pt={6} justify="space-between">
            <Button
              bg="white"
              color="#1A202C" // Sötét szöveg a fehér gombon
              height="50px"
              width="48%"
              fontWeight="bold"
              borderRadius="xl"
              _hover={{ bg: "gray.100" }}
              onClick={() => navigate('/utazastervezo')}
            >
              Mégse
            </Button>
            
            <Button
              bg="#232B5C" // Sötétkék háttér
              color="white"
              height="50px"
              width="48%"
              fontWeight="bold"
              borderRadius="xl"
              _hover={{ bg: "#1a214d", transform: "scale(1.02)" }}
              isLoading={loading}
              onClick={handleSave}
              boxShadow="0 4px 15px rgba(0,0,0,0.3)"
            >
              Mentés
            </Button>
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
};

export default UjUtHozzaadasaOldal;
