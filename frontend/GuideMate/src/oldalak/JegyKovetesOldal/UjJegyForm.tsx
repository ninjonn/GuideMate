import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  VStack,
  useToast,
  HStack,
  Center,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  createFoglalas,
  type CreateFoglalasDto,
  type FoglalasTipus,
} from "../../features/foglalas/foglalas.api";

// --- Stílus konstansok ---
const glassInputStyle = {
  bg: "rgba(255, 255, 255, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "white",
  _placeholder: { color: "rgba(255, 255, 255, 0.7)" },
  _focus: { 
    bg: "rgba(255, 255, 255, 0.25)", 
    borderColor: "white", 
    boxShadow: "none" 
  },
  _hover: {
    bg: "rgba(255, 255, 255, 0.2)",
  },
  borderRadius: "lg",
  height: "48px",
  fontSize: "15px",
  width: "100%",
};

const labelStyle = {
  color: "white",
  fontSize: "13px",
  fontWeight: "600",
  mb: 1.5,
  ml: 1,
  opacity: 0.9
};

const UjJegyForm: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const utazasId = 1; 

  const [tipus, setTipus] = useState<FoglalasTipus>("busz");
  const [loading, setLoading] = useState(false);

  // travel
  const [indulasiHely, setIndulasiHely] = useState("");
  const [erkezesiHely, setErkezesiHely] = useState("");
  const [indulasiIdo, setIndulasiIdo] = useState(""); 
  const [erkezesiIdo, setErkezesiIdo] = useState(""); 
  const [jaratszam, setJaratszam] = useState("");

  // szállás
  const [hely, setHely] = useState("");
  const [cim, setCim] = useState("");
  const [kezdoDatum, setKezdoDatum] = useState(""); 
  const [vegDatum, setVegDatum] = useState(""); 

  const isTravel = useMemo(
    () => tipus === "repulo" || tipus === "busz" || tipus === "vonat",
    [tipus],
  );

  function toIsoFromDatetimeLocal(value: string): string {
    if (!value) return "";
    const d = new Date(value);
    return d.toISOString();
  }

  async function onSubmit() {
    try {
      setLoading(true);

      let dto: CreateFoglalasDto;

      if (isTravel) {
        const a = indulasiHely.trim();
        const b = erkezesiHely.trim();

        if (!a || !b || !indulasiIdo || !erkezesiIdo) {
          toast({
            title: "Hiányzó adatok",
            description: "Add meg az indulási/érkezési helyet és időpontokat.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }

        dto = {
          tipus: tipus as "repulo" | "busz" | "vonat",
          indulasi_hely: a,
          erkezesi_hely: b,
          indulasi_ido: toIsoFromDatetimeLocal(indulasiIdo),
          erkezesi_ido: toIsoFromDatetimeLocal(erkezesiIdo),
          jaratszam: jaratszam.trim() ? jaratszam.trim() : null,
        };
      } else {
        const h = hely.trim();
        const c = cim.trim();

        if (!h || !c || !kezdoDatum || !vegDatum) {
          toast({
            title: "Hiányzó adatok",
            description: "Add meg a szállás helyét, címét és dátumokat.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }

        dto = {
          tipus: "szallas",
          hely: h,
          cim: c,
          kezdo_datum: kezdoDatum,
          veg_datum: vegDatum,
        };
      }

      await createFoglalas(utazasId, dto);

      toast({
        title: "Sikeres mentés",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      navigate("/jegykovetes");
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
  }

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
          // JAVÍTÁS: Növelt szélesség (560px), hogy minden kényelmesen elférjen
          w={{ base: "100%", sm: "560px" }} 
          spacing={5} 
          p={{ base: 6, md: 8 }}
          
          // --- Glassmorphism Container ---
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(12px)"
          borderRadius="20px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
          align="stretch"
        >
          <Heading size="lg" textAlign="center" fontWeight="700" mb={2}>
            Új jegy hozzáadása
          </Heading>

          <FormControl>
            <FormLabel {...labelStyle}>Utazás típusa</FormLabel>
            <Select
              value={tipus}
              onChange={(e) => setTipus(e.target.value as FoglalasTipus)}
              sx={{
                ...glassInputStyle,
                '> option': {
                  background: '#232B5C',
                  color: 'white'
                }
              }}
              iconColor="white"
            >
              <option value="repulo">Repülő</option>
              <option value="busz">Busz</option>
              <option value="vonat">Vonat</option>
              <option value="szallas">Szállás</option>
            </Select>
          </FormControl>

          {isTravel ? (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...labelStyle}>Kiindulási hely</FormLabel>
                <Input
                  value={indulasiHely}
                  onChange={(e) => setIndulasiHely(e.target.value)}
                  placeholder="Pl. Budapest"
                  {...glassInputStyle}
                  px={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Érkezési hely</FormLabel>
                <Input
                  value={erkezesiHely}
                  onChange={(e) => setErkezesiHely(e.target.value)}
                  placeholder="Pl. Párizs"
                  {...glassInputStyle}
                  px={4}
                />
              </FormControl>

              <HStack spacing={3} w="100%">
                <FormControl>
                  <FormLabel {...labelStyle}>Indulás ideje</FormLabel>
                  <Input
                    type="datetime-local"
                    value={indulasiIdo}
                    onChange={(e) => setIndulasiIdo(e.target.value)}
                    {...glassInputStyle}
                    px={4}
                    sx={{
                      '::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        opacity: 0.8,
                        cursor: 'pointer'
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Érkezés ideje</FormLabel>
                  <Input
                    type="datetime-local"
                    value={erkezesiIdo}
                    onChange={(e) => setErkezesiIdo(e.target.value)}
                    {...glassInputStyle}
                    px={4}
                    sx={{
                      '::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        opacity: 0.8,
                        cursor: 'pointer'
                      }
                    }}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel {...labelStyle}>Járatszám (opcionális)</FormLabel>
                <Input
                  value={jaratszam}
                  onChange={(e) => setJaratszam(e.target.value)}
                  placeholder="A járatod száma..."
                  {...glassInputStyle}
                  px={4}
                />
              </FormControl>
            </VStack>
          ) : (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...labelStyle}>Hely</FormLabel>
                <Input
                  value={hely}
                  onChange={(e) => setHely(e.target.value)}
                  placeholder="Pl. Hotel neve"
                  {...glassInputStyle}
                  px={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Cím</FormLabel>
                <Input
                  value={cim}
                  onChange={(e) => setCim(e.target.value)}
                  placeholder="Pl. Utca, házszám"
                  {...glassInputStyle}
                  px={4}
                />
              </FormControl>

              <HStack spacing={3} w="100%">
                <FormControl>
                  <FormLabel {...labelStyle}>Kezdő dátum</FormLabel>
                  <Input
                    type="date"
                    value={kezdoDatum}
                    onChange={(e) => setKezdoDatum(e.target.value)}
                    {...glassInputStyle}
                    px={4}
                    sx={{
                      '::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        opacity: 0.8
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Vég dátum</FormLabel>
                  <Input
                    type="date"
                    value={vegDatum}
                    onChange={(e) => setVegDatum(e.target.value)}
                    {...glassInputStyle}
                    px={4}
                    sx={{
                      '::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        opacity: 0.8
                      }
                    }}
                  />
                </FormControl>
              </HStack>
            </VStack>
          )}

          {/* Gombok */}
          <HStack spacing={3} pt={4} justify="space-between">
             <Button
              bg="white"
              color="#232B5C"
              height="48px"
              width="48%"
              fontWeight="600"
              borderRadius="lg"
              _hover={{ bg: "gray.200" }}
              onClick={() => navigate(-1)}
            >
              Mégse
            </Button>
            
            <Button
              bg="#232B5C"
              color="white"
              height="48px"
              width="48%"
              fontWeight="600"
              borderRadius="lg"
              _hover={{ filter: "brightness(1.2)" }}
              isLoading={loading}
              onClick={() => void onSubmit()}
              boxShadow="0 4px 12px rgba(0,0,0,0.2)"
            >
              Hozzáadás
            </Button>
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
};

export default UjJegyForm;