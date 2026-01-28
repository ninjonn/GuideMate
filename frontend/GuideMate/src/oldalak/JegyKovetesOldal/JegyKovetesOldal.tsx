import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  IconButton,
  Icon,
  ChakraProvider,
  extendTheme,
  Container,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import {
  deleteFoglalas,
  listFoglalasok,
  type Foglalas,
} from "../../features/foglalas/foglalas.api";

const theme = extendTheme({
  fonts: { heading: `'Inter', sans-serif`, body: `'Inter', sans-serif` },
});

const TIPUS_LABEL: Record<Foglalas["tipus"], string> = {
  repulo: "repülő",
  busz: "busz",
  vonat: "vonat",
  szallas: "szállás",
};

function formatDateTime(iso: string) {
  // egyszerű megjelenítés: 2026-01-14T10:00:00.000Z -> helyi
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const JegyKovetesOldal: React.FC = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [foglalasok, setFoglalasok] = useState<Foglalas[]>([]);
  const [query, setQuery] = useState("");

  async function load() {
    try {
      setLoading(true);
      const res = await listFoglalasok();
      setFoglalasok(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült betölteni a foglalásokat",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foglalasok;

    return foglalasok.filter((f) => {
      if (f.tipus === "szallas") {
        return (
          f.hely.toLowerCase().includes(q) || f.cim.toLowerCase().includes(q)
        );
      }
      return (
        f.indulasi_hely.toLowerCase().includes(q) ||
        f.erkezesi_hely.toLowerCase().includes(q) ||
        (f.jaratszam ?? "").toLowerCase().includes(q) ||
        f.tipus.toLowerCase().includes(q)
      );
    });
  }, [foglalasok, query]);

  async function onDelete(id: number) {
    try {
      await deleteFoglalas(id);
      toast({
        title: "Törölve",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      // egyszerű: újratöltés
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Törlés sikertelen",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <Box
        minH="100vh"
        w="100vw"
        bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
        position="relative"
        overflowX="hidden"
        color="white"
      >
        <Container maxW="1000px" pt={{ base: 24, md: 32 }} pb={10} px={4}>
          <VStack spacing={8} w="100%">
            <VStack spacing={2} textAlign="center">
              <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} fontWeight="700">
                Jegykövetés
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} maxW="600px" color="whiteAlpha.900">
                Add hozzá manuálisan utazási jegyeid és kövesd, hol tartanak az utazásaid.
              </Text>
            </VStack>

            <Flex
              w="100%"
              direction={{ base: "column", md: "row" }}
              gap={4}
              justify="center"
              align="center"
              mt={4}
            >
              <InputGroup maxW={{ base: "100%", md: "400px" }}>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  bg="white"
                  color="gray.800"
                  placeholder="Keresés típus / hely / járatszám alapján"
                  _placeholder={{ color: "gray.500" }}
                  borderRadius="full"
                  height="50px"
                  pl={6}
                  boxShadow="md"
                />
                <InputLeftElement height="50px" right="10px" left="auto" pointerEvents="none">
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
              </InputGroup>

              <Button
                as={RouterLink}
                to="/uj-jegy" // ezt a route-ot a routerben állítsd be az UjJegyForm oldalra
                leftIcon={<FaPlus size={12} />}
                bg="#232B5C"
                color="white"
                height="50px"
                px={8}
                borderRadius="lg"
                fontWeight="600"
                _hover={{ bg: "#1a214d", transform: "scale(1.02)" }}
                transition="all 0.2s"
                boxShadow="lg"
                w={{ base: "100%", md: "auto" }}
                isLoading={loading}
              >
                Új jegy hozzáadása
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%" mt={8}>
              {filtered.map((f) => (
                <Box
                  key={f.azonosito}
                  bg="rgba(255, 255, 255, 0.15)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  p={6}
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                  transition="transform 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 12px rgba(0,0,0,0.15)" }}
                >
                  <Flex justify="space-between" align="start" mb={4}>
                    <Heading size="lg" fontWeight="700" textTransform="capitalize">
                      {TIPUS_LABEL[f.tipus]}
                    </Heading>

                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit"
                        icon={<Icon as={FaPen} />}
                        variant="outline"
                        colorScheme="whiteAlpha"
                        size="sm"
                        borderRadius="md"
                        border="1px solid rgba(255,255,255,0.3)"
                        _hover={{ bg: "whiteAlpha.200" }}
                        as={RouterLink}
                        to={`/jegy-szerkesztes/${f.azonosito}`}
                        state={{ foglalas: f }}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<Icon as={FaTrash} />}
                        variant="outline"
                        colorScheme="whiteAlpha"
                        size="sm"
                        borderRadius="md"
                        border="1px solid rgba(255,255,255,0.3)"
                        _hover={{ bg: "red.500", borderColor: "red.500" }}
                        onClick={() => void onDelete(f.azonosito)}
                      />
                    </HStack>
                  </Flex>

                  <VStack align="start" spacing={3} fontSize="md" fontWeight="500">
                    {f.tipus === "szallas" ? (
                      <>
                        <Text>{f.hely}</Text>
                        <Text color="whiteAlpha.900">Cím: {f.cim}</Text>
                        <Text color="whiteAlpha.900">Kezdete: {f.kezdo_datum}</Text>
                        <Text color="whiteAlpha.900">Vége: {f.veg_datum}</Text>
                      </>
                    ) : (
                      <>
                        <Text>
                          {f.indulasi_hely} <span style={{ opacity: 0.7, margin: "0 5px" }}>→</span> {f.erkezesi_hely}
                        </Text>
                        <Text color="whiteAlpha.900">Indulás: {formatDateTime(f.indulasi_ido)}</Text>
                        <Text color="whiteAlpha.900">Érkezés: {formatDateTime(f.erkezesi_ido)}</Text>
                        <Text color="whiteAlpha.900">Járatszám: {f.jaratszam ?? "-"}</Text>
                      </>
                    )}
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>

            {!loading && filtered.length === 0 && (
              <Text color="whiteAlpha.900">Nincs találat.</Text>
            )}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default JegyKovetesOldal;
