import React, { useEffect, useMemo, useState } from "react";
import { Box, Center, Heading, VStack, useToast } from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createFoglalas,
  listFoglalasok,
  updateFoglalas,
  type Foglalas,
  type CreateFoglalasDto,
  type FoglalasTipus,
} from "../../features/foglalas/foglalas.api";
import UjJegyTipusValaszto from "./komponensek/UjJegyTipusValaszto";
import UjJegyUtazasMezok from "./komponensek/UjJegyUtazasMezok";
import UjJegySzallasMezok from "./komponensek/UjJegySzallasMezok";
import UjJegyGombok from "./komponensek/UjJegyGombok";

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
      w="100%"
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

          <UjJegyTipusValaszto value={tipus} onChange={setTipus} />

          {isTravel ? (
            <UjJegyUtazasMezok
              tipus={tipus}
              indulasiHely={indulasiHely}
              erkezesiHely={erkezesiHely}
              indulasiIdo={indulasiIdo}
              erkezesiIdo={erkezesiIdo}
              jaratszam={jaratszam}
              onIndulasiHely={setIndulasiHely}
              onErkezesiHely={setErkezesiHely}
              onIndulasiIdo={setIndulasiIdo}
              onErkezesiIdo={setErkezesiIdo}
              onJaratszam={setJaratszam}
            />
          ) : (
            <UjJegySzallasMezok
              hely={hely}
              cim={cim}
              kezdoDatum={kezdoDatum}
              vegDatum={vegDatum}
              onHely={setHely}
              onCim={setCim}
              onKezdoDatum={setKezdoDatum}
              onVegDatum={setVegDatum}
            />
          )}

          <UjJegyGombok
            isEdit={isEdit}
            isLoading={loading || fetching}
            onCancel={() => navigate(-1)}
            onSave={() => void onSubmit()}
          />
        </VStack>
      </Center>
    </Box>
  );
};

export default UjJegyForm;
