import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { format, parse } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { getUtazas, updateUtazas } from '../../features/utazas/utazas.api';
import ChakraDatePicker from '../../komponensek/ui/ChakraDatePicker';

// --- Stílus konstansok (Konzisztens a többi oldallal) ---
const glassInputStyle = {
  bg: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  _placeholder: { color: 'rgba(255, 255, 255, 0.6)' },
  _focus: {
    bg: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'white',
    boxShadow: 'none',
  },
  _hover: {
    bg: 'rgba(255, 255, 255, 0.2)',
  },
  borderRadius: 'lg',
  height: '50px',
  fontSize: '16px',
};

const labelStyle = {
  color: 'white',
  fontSize: '14px',
  fontWeight: '600',
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

const UtazasSzerkeszteseOldal: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Adatok betöltése a backendről ---
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getUtazas(Number(id));
        setTitle(res.cim);
        setDescription(res.leiras ?? '');
        setStartDate(
          res.kezdo_datum
            ? parse(res.kezdo_datum, 'yyyy-MM-dd', new Date())
            : null,
        );
        setEndDate(
          res.veg_datum ? parse(res.veg_datum, 'yyyy-MM-dd', new Date()) : null,
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Ismeretlen hiba';
        toast({
          title: 'Nem sikerült betölteni az utazást',
          description: msg,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, toast]);

  const handleSave = async () => {
    if (!title || !startDate || !endDate) {
      toast({
        title: 'Hiányzó adatok',
        description: 'Minden mező kitöltése kötelező.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: 'Hibás dátum',
        description: 'A záró dátum nem lehet korábban, mint a kezdő dátum.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);

    try {
      if (!id) {
        throw new Error('Hiányzó utazás ID');
      }
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');
      const res = await updateUtazas(Number(id), {
        cim: title,
        leiras: description || undefined,
        kezdo_datum: formattedStart,
        veg_datum: formattedEnd,
      });

      toast({
        title: 'Sikeres módosítás',
        description: 'Az utazás adatai frissültek.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      const frissitettTrip = {
        id: res.azonosito,
        title: res.cim,
        description: res.leiras ?? '',
        startDate: res.kezdo_datum,
        endDate: res.veg_datum,
        days: calcDays(res.kezdo_datum, res.veg_datum),
        programs: 0,
        checklistDone: 0,
        checklistTotal: 0,
      };

      navigate('/utazastervezo', { state: { frissitettTrip } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ismeretlen hiba';
      toast({
        title: 'Mentés sikertelen',
        description: msg,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      position="relative"
      overflow="hidden"
      pt={{ base: 20, md: 24 }}
    >
      <Center minH="100vh" px={4} mt={-20}>
        <VStack
          w={{ base: '100%', sm: '520px' }}
          spacing={6}
          p={{ base: 8, md: 10 }}
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(15px)"
          borderRadius="24px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.25)"
          align="stretch"
        >
          <Heading size="lg" textAlign="center" fontWeight="bold" mb={4}>
            Utazás szerkesztése
          </Heading>

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" color="white" thickness="4px" />
            </Center>
          ) : (
            <VStack spacing={5}>
              <FormControl>
                <FormLabel {...labelStyle}>Utazás neve</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  {...glassInputStyle}
                  px={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Leírás</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
          )}

          <HStack spacing={4} pt={6} justify="space-between">
            <Button
              bg="white"
              color="#1A202C"
              height="50px"
              width="48%"
              fontWeight="bold"
              borderRadius="xl"
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/utazastervezo')}
              isDisabled={saving}
            >
              Mégse
            </Button>

            <Button
              bg="#232B5C"
              color="white"
              height="50px"
              width="48%"
              fontWeight="bold"
              borderRadius="xl"
              _hover={{ bg: '#1a214d', transform: 'scale(1.02)' }}
              isLoading={saving}
              isDisabled={loading}
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

export default UtazasSzerkeszteseOldal;
