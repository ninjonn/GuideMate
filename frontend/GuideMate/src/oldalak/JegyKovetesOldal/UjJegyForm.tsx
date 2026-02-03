import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createFoglalas,
  listFoglalasok,
  updateFoglalas,
  type Foglalas,
  type CreateFoglalasDto,
  type FoglalasTipus,
} from "../../features/foglalas/foglalas.api";
import ChakraDatePicker from "../../komponensek/ui/ChakraDatePicker";

// --- Stílusok ---
const glassInputStyle = {
  bg: "rgba(255, 255, 255, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "white",
  _placeholder: { color: "rgba(255, 255, 255, 0.7)" },
  _focus: { 
    bg: "rgba(255, 255, 255, 0.25)", 
    borderColor: "#7BCBFF", 
    boxShadow: "0 0 0 1px #7BCBFF" 
  },
  _hover: {
    bg: "rgba(255, 255, 255, 0.2)",
  },
  borderRadius: "lg",
  height: "48px",
  fontSize: "15px",
  width: "100%",
  cursor: "pointer"
};

const labelStyle = {
  color: "white",
  fontSize: "13px",
  fontWeight: "600",
  mb: 1.5,
  ml: 1,
  opacity: 0.9
};

// --- FŐ FORLAP KOMPONENS ---
const UjJegyForm: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const foglalasId = id ? Number(id) : null;

  const [tipus, setTipus] = useState<FoglalasTipus>("busz");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // travel state
  const [indulasiHely, setIndulasiHely] = useState("");
  const [erkezesiHely, setErkezesiHely] = useState("");
  const [indulasiIdo, setIndulasiIdo] = useState<Date | null>(null);
  const [erkezesiIdo, setErkezesiIdo] = useState<Date | null>(null);
  const [jaratszam, setJaratszam] = useState("");

  // szállás state
  const [hely, setHely] = useState("");
  const [cim, setCim] = useState("");
  const [kezdoDatum, setKezdoDatum] = useState<Date | null>(null);
  const [vegDatum, setVegDatum] = useState<Date | null>(null);

  const isTravel = useMemo(
    () =>
      tipus === "repulo" ||
      tipus === "busz" ||
      tipus === "vonat" ||
      tipus === "auto",
    [tipus],
  );

  function applyFoglalas(f: Foglalas) {
    setTipus(f.tipus);
    if (f.tipus === "szallas") {
      setHely(f.hely);
      setCim(f.cim);
      setKezdoDatum(f.kezdo_datum ? new Date(f.kezdo_datum) : null);
      setVegDatum(f.veg_datum ? new Date(f.veg_datum) : null);
    } else {
      setIndulasiHely(f.indulasi_hely);
      setErkezesiHely(f.erkezesi_hely);
      setIndulasiIdo(f.indulasi_ido ? new Date(f.indulasi_ido) : null);
      setErkezesiIdo(f.erkezesi_ido ? new Date(f.erkezesi_ido) : null);
      setJaratszam(f.jaratszam ?? "");
    }
  }

  useEffect(() => {
    if (!isEdit || foglalasId === null || Number.isNaN(foglalasId)) return;
    const stateFoglalas = (location.state as { foglalas?: Foglalas } | null)?.foglalas;
    if (stateFoglalas?.azonosito === foglalasId) {
      applyFoglalas(stateFoglalas);
      return;
    }

    let isMounted = true;
    const load = async () => {
      try {
        setFetching(true);
        const res = await listFoglalasok();
        const found = res.find((item) => item.azonosito === foglalasId);
        if (!found) {
          toast({ title: "A jegy nem található", status: "warning", duration: 3000, isClosable: true });
          navigate("/jegykovetes");
          return;
        }
        if (isMounted) applyFoglalas(found);
      } catch (err: unknown) {
        toast({ title: "Hiba", description: "Nem sikerült betölteni", status: "error" });
      } finally {
        if (isMounted) setFetching(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, [isEdit, foglalasId, location.state, navigate, toast]);

  async function onSubmit() {
    try {
      setLoading(true);
      let dto: CreateFoglalasDto;

      if (isTravel) {
        if (!indulasiHely || !erkezesiHely || !indulasiIdo || !erkezesiIdo) {
          throw new Error("Töltsd ki a kötelező mezőket (helyek, idők)!");
        }
        dto = {
          tipus: tipus as "repulo" | "busz" | "vonat" | "auto",
          indulasi_hely: indulasiHely,
          erkezesi_hely: erkezesiHely,
          indulasi_ido: indulasiIdo.toISOString(),
          erkezesi_ido: erkezesiIdo.toISOString(),
          jaratszam: tipus === "auto" ? null : jaratszam || null,
        };
      } else {
        if (!hely || !cim || !kezdoDatum || !vegDatum) {
          throw new Error("Töltsd ki a kötelező mezőket (hely, cím, dátumok)!");
        }
        dto = {
          tipus: "szallas",
          hely,
          cim,
          kezdo_datum: kezdoDatum.toISOString().split("T")[0],
          veg_datum: vegDatum.toISOString().split("T")[0],
        };
      }

      if (isEdit && foglalasId) {
        await updateFoglalas(foglalasId, dto);
      } else {
        await createFoglalas(dto);
      }

      toast({ title: "Sikeres mentés", status: "success", duration: 2000 });
      navigate("/jegykovetes");
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message || "Sikertelen mentés", status: "error" });
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
          w={{ base: "100%", sm: "560px" }} 
          spacing={5} 
          p={{ base: 6, md: 8 }}
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(12px)"
          borderRadius="20px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
          align="stretch"
        >
          <Heading size="lg" textAlign="center" fontWeight="700" mb={2}>
            {isEdit ? "Jegy szerkesztése" : "Új jegy hozzáadása"}
          </Heading>

          <FormControl>
            <FormLabel {...labelStyle}>Utazás típusa</FormLabel>
            <Select
              value={tipus}
              onChange={(e) => setTipus(e.target.value as FoglalasTipus)}
              sx={{
                ...glassInputStyle,
                '> option': { background: '#232B5C', color: 'white' }
              }}
              iconColor="white"
            >
              <option value="repulo">Repülő</option>
              <option value="busz">Busz</option>
              <option value="vonat">Vonat</option>
              <option value="auto">Autó</option>
              <option value="szallas">Szállás</option>
            </Select>
          </FormControl>

          {isTravel ? (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...labelStyle}>Kiindulási hely</FormLabel>
                <Input value={indulasiHely} onChange={(e) => setIndulasiHely(e.target.value)} placeholder="Pl. Budapest" {...glassInputStyle} px={4} />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Érkezési hely</FormLabel>
                <Input value={erkezesiHely} onChange={(e) => setErkezesiHely(e.target.value)} placeholder="Pl. Párizs" {...glassInputStyle} px={4} />
              </FormControl>

              <HStack spacing={3} w="100%">
                <FormControl>
                  <FormLabel {...labelStyle}>Indulás ideje</FormLabel>
                  <ChakraDatePicker
                    selectedDate={indulasiIdo}
                    onChange={setIndulasiIdo}
                    showTime={true}
                    placeholder="Válassz időpontot"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Érkezés ideje</FormLabel>
                  <ChakraDatePicker
                    selectedDate={erkezesiIdo}
                    onChange={setErkezesiIdo}
                    showTime={true}
                    placeholder="Válassz időpontot"
                    minDate={indulasiIdo || undefined}
                  />
                </FormControl>
              </HStack>

              {tipus !== "auto" && (
                <FormControl>
                  <FormLabel {...labelStyle}>Járatszám (opcionális)</FormLabel>
                  <Input value={jaratszam} onChange={(e) => setJaratszam(e.target.value)} placeholder="A járatod száma..." {...glassInputStyle} px={4} />
                </FormControl>
              )}
            </VStack>
          ) : (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...labelStyle}>Hely</FormLabel>
                <Input value={hely} onChange={(e) => setHely(e.target.value)} placeholder="Pl. Hotel neve" {...glassInputStyle} px={4} />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Cím</FormLabel>
                <Input value={cim} onChange={(e) => setCim(e.target.value)} placeholder="Pl. Utca, házszám" {...glassInputStyle} px={4} />
              </FormControl>

              <HStack spacing={3} w="100%">
                <FormControl>
                  <FormLabel {...labelStyle}>Kezdő dátum</FormLabel>
                  <ChakraDatePicker
                    selectedDate={kezdoDatum}
                    onChange={setKezdoDatum}
                    showTime={false}
                    placeholder="ÉÉÉÉ. HH. NN."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Vég dátum</FormLabel>
                  <ChakraDatePicker
                    selectedDate={vegDatum}
                    onChange={setVegDatum}
                    showTime={false}
                    placeholder="ÉÉÉÉ. HH. NN."
                    minDate={kezdoDatum || undefined}
                  />
                </FormControl>
              </HStack>
            </VStack>
          )}

          <HStack spacing={3} pt={4} justify="space-between">
             <Button bg="white" color="#232B5C" height="48px" width="48%" fontWeight="600" borderRadius="lg" _hover={{ bg: "gray.200" }} onClick={() => navigate(-1)}>
              Mégse
            </Button>
            
            <Button bg="#232B5C" color="white" height="48px" width="48%" fontWeight="600" borderRadius="lg" _hover={{ filter: "brightness(1.2)" }} isLoading={loading || fetching} onClick={() => void onSubmit()} boxShadow="0 4px 12px rgba(0,0,0,0.2)">
              {isEdit ? "Mentés" : "Hozzáadás"}
            </Button>
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
};

export default UjJegyForm;
