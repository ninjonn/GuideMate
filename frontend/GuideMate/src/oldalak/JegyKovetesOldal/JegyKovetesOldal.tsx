import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  VStack,
  ChakraProvider,
  extendTheme,
  Container,
  useToast,
} from "@chakra-ui/react";
import {
  deleteFoglalas,
  listFoglalasok,
  type Foglalas,
} from "../../features/foglalas/foglalas.api";
import JegyKartya from "./komponensek/JegyKartya";
import JegyKeresesSzekcio from "./komponensek/JegyKeresesSzekcio";
import JegyKovetesFejlec from "./komponensek/JegyKovetesFejlec";

const theme = extendTheme({
  fonts: { heading: `'Inter', sans-serif`, body: `'Inter', sans-serif` },
});

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
            <JegyKovetesFejlec />

            <JegyKeresesSzekcio
              query={query}
              onQueryChange={setQuery}
              loading={loading}
            />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%" mt={8}>
              {filtered.map((f) => (
                <JegyKartya key={f.azonosito} foglalas={f} onDelete={onDelete} />
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
