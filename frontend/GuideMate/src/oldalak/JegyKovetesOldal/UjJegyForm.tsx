import React, { useEffect, useMemo, useState } from "react";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createFoglalas,
  listFoglalasok,
  updateFoglalas,
  type Foglalas,
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

const calendarFocusColor = "#7BCBFF";
const glassCalendarInputStyle = {
  ...glassInputStyle,
  _focus: {
    bg: "rgba(255, 255, 255, 0.25)",
    borderColor: calendarFocusColor,
    boxShadow: "0 0 0 2px rgba(123, 203, 255, 0.35)",
  },
  _focusVisible: {
    bg: "rgba(255, 255, 255, 0.25)",
    borderColor: calendarFocusColor,
    boxShadow: "0 0 0 2px rgba(123, 203, 255, 0.35)",
  },
  sx: {
    "::-webkit-calendar-picker-indicator": {
      filter: "invert(1) sepia(1) saturate(4) hue-rotate(180deg)",
      opacity: 0.9,
      cursor: "pointer",
    },
    "::-webkit-datetime-edit": { color: "white" },
    "::-webkit-datetime-edit-text": { color: "rgba(255,255,255,0.7)" },
    "::-webkit-datetime-edit-fields-wrapper": { padding: "0 2px" },
    "::-webkit-datetime-edit-month-field:focus": {
      background: "rgba(123, 203, 255, 0.35)",
      color: "#0B1E3A",
      borderRadius: "4px",
    },
    "::-webkit-datetime-edit-day-field:focus": {
      background: "rgba(123, 203, 255, 0.35)",
      color: "#0B1E3A",
      borderRadius: "4px",
    },
    "::-webkit-datetime-edit-year-field:focus": {
      background: "rgba(123, 203, 255, 0.35)",
      color: "#0B1E3A",
      borderRadius: "4px",
    },
    "::-webkit-datetime-edit-hour-field:focus": {
      background: "rgba(123, 203, 255, 0.35)",
      color: "#0B1E3A",
      borderRadius: "4px",
    },
    "::-webkit-datetime-edit-minute-field:focus": {
      background: "rgba(123, 203, 255, 0.35)",
      color: "#0B1E3A",
      borderRadius: "4px",
    },
    "::-webkit-datetime-edit-ampm-field:focus": {
      background: "rgba(123, 203, 255, 0.35)",
      color: "#0B1E3A",
      borderRadius: "4px",
    },
  },
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
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const foglalasId = id ? Number(id) : null;

  const [tipus, setTipus] = useState<FoglalasTipus>("busz");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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

  function toDatetimeLocalFromIso(value: string): string {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function applyFoglalas(f: Foglalas) {
    setTipus(f.tipus);
    if (f.tipus === "szallas") {
      setHely(f.hely);
      setCim(f.cim);
      setKezdoDatum(f.kezdo_datum);
      setVegDatum(f.veg_datum);
    } else {
      setIndulasiHely(f.indulasi_hely);
      setErkezesiHely(f.erkezesi_hely);
      setIndulasiIdo(toDatetimeLocalFromIso(f.indulasi_ido));
      setErkezesiIdo(toDatetimeLocalFromIso(f.erkezesi_ido));
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
          toast({
            title: "A jegy nem található",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          navigate("/jegykovetes");
          return;
        }
        if (isMounted) {
          applyFoglalas(found);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
        toast({
          title: "Nem sikerült betölteni a jegyet",
          description: msg,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [isEdit, foglalasId, location.state, navigate, toast]);

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

      if (isEdit && foglalasId !== null && !Number.isNaN(foglalasId)) {
        await updateFoglalas(foglalasId, dto);
      } else {
        await createFoglalas(dto);
      }

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
            {isEdit ? "Jegy szerkesztése" : "Új jegy hozzáadása"}
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
                    {...glassCalendarInputStyle}
                    px={4}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Érkezés ideje</FormLabel>
                  <Input
                    type="datetime-local"
                    value={erkezesiIdo}
                    onChange={(e) => setErkezesiIdo(e.target.value)}
                    {...glassCalendarInputStyle}
                    px={4}
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
                  {...glassCalendarInputStyle}
                  px={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Vég dátum</FormLabel>
                <Input
                  type="date"
                  value={vegDatum}
                  onChange={(e) => setVegDatum(e.target.value)}
                  {...glassCalendarInputStyle}
                  px={4}
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
              isLoading={loading || fetching}
              onClick={() => void onSubmit()}
              boxShadow="0 4px 12px rgba(0,0,0,0.2)"
            >
              {isEdit ? "Mentés" : "Hozzáadás"}
            </Button>
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
};

export default UjJegyForm;
