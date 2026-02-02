import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Collapse,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  IconButton,
  Image,
  Flex,
  useToast,
  FormControl,
  FormLabel,
  Divider,
  Textarea,
  Stack,
  useBreakpointValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { SearchIcon, TimeIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  getCoordinates, 
  getPlaces,
  searchAndFilterPlaces,
  getMapboxTileUrl, 
  SEARCH_CATEGORIES,
  type CoordinatesResult,
  type Place 
} from '../../lib/opentripmap';
import { listUtazasok, type UtazasListItem } from '../../features/utazas/utazas.api';
import { createProgram } from '../../features/program/program.api';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error Leaflet default icon typing does not expose private field.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const selectedIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 22.1 12.5 41 12.5 41S25 22.1 25 12.5C25 5.6 19.4 0 12.5 0z" fill="%23232b5c"/><circle cx="12.5" cy="12.5" r="5.5" fill="%23fff"/></svg>',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const glassPanelStyle = {
  bg: "rgba(255, 255, 255, 0.6)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
  borderRadius: "20px",
};

const LIMIT = 30;
const DEFAULT_RADIUS = 8000;
const MIN_RADIUS = 1000;
const MAX_RADIUS = 12000;

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

const getViewportRadius = (map: L.Map) => {
  const bounds = map.getBounds();
  const center = bounds.getCenter();
  const radius = map.distance(center, bounds.getNorthEast());
  return Math.min(Math.max(radius, MIN_RADIUS), MAX_RADIUS);
};

function MapUpdater({
  center,
  shouldFlyRef,
}: {
  center: [number, number];
  shouldFlyRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!shouldFlyRef.current) return;
    map.setView(center, map.getZoom(), { animate: false });
    shouldFlyRef.current = false;
  }, [center, map, shouldFlyRef]);
  return null;
}

function MapMoveHandler({
  onMoveEnd,
  radiusRef,
}: {
  onMoveEnd: (center: [number, number], radius: number) => void;
  radiusRef: React.MutableRefObject<number>;
}) {
  const map = useMapEvents({
    dragend: () => {
      const center = map.getCenter();
      const radius = getViewportRadius(map);
      radiusRef.current = radius;
      onMoveEnd([center.lat, center.lng], radius);
    },
    zoomend: () => {
      const center = map.getCenter();
      const radius = getViewportRadius(map);
      radiusRef.current = radius;
      onMoveEnd([center.lat, center.lng], radius);
    },
  });
  useEffect(() => {
    radiusRef.current = getViewportRadius(map);
  }, [map, radiusRef]);
  return null;
}

const TerkepOldal: React.FC = () => {
  const toast = useToast();
  
  // Mobilnézet detektálása a feltételes rendereléshez
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;

  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("interesting_places");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mode, setMode] = useState<'area' | 'specific'>('area');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const addProgramModal = useDisclosure();

  const shouldFlyRef = useRef(false);
  const mapRadiusRef = useRef(DEFAULT_RADIUS);
  const requestSeqRef = useRef(0);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("");
  const [trips, setTrips] = useState<UtazasListItem[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | ''>('');
  const [selectedDay, setSelectedDay] = useState<number | ''>('');

  useEffect(() => {
    if (isMobile) {
      setIsPanelOpen(false);
    } else {
      setIsPanelOpen(true);
    }
  }, [isMobile]);

  const flyToCenter = (center: [number, number]) => {
    shouldFlyRef.current = true;
    setMapCenter(center);
  };

  const fetchPlaces = async (
    center: [number, number],
    categoryId: string,
    nextOffset = 0,
    append = false,
    radiusOverride?: number
  ) => {
    const requestId = (requestSeqRef.current += 1);
    const radius = radiusOverride ?? mapRadiusRef.current;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingPlaces(true);
        setLoadingMore(false);
      }
      const result = await getPlaces(center[0], center[1], categoryId, {
        limit: LIMIT,
        offset: nextOffset,
        radius,
      });
      const normalized = Array.isArray(result.items) ? result.items : [];

      if (requestId !== requestSeqRef.current) {
        return;
      }

      setPlaces((prev) => {
        const base = append ? prev : [];
        const existing = new Set(base.map((p) => p.xid));
        const merged = [...base];
        normalized.forEach((item) => {
          if (!existing.has(item.xid)) {
            existing.add(item.xid);
            merged.push(item);
          }
        });
        return merged;
      });

      setOffset(nextOffset);
      setHasMore(result.hasMore);
    } catch (error) {
      if (requestId !== requestSeqRef.current) {
        return;
      }
      const msg = error instanceof Error ? error.message : "Ismeretlen hiba";
      toast({ title: "Hiba", description: msg, status: "error" });
    } finally {
      if (requestId === requestSeqRef.current) {
        setLoadingPlaces(false);
        setLoadingMore(false);
      }
    }
  };

  const handleSearch = async () => {
    if (isMobile) {
      setIsPanelOpen(true);
    }
    if (!searchQuery.trim()) {
      toast({ title: "Hiba", description: "Írj be valamit!", status: "error" });
      return;
    }

    let coords: CoordinatesResult | null = null;
    try {
      coords = await getCoordinates(searchQuery);
    } catch (error) {
      console.warn("Geokód sikertelen", error);
    }

    const tokens = searchQuery.trim().split(/\s+/);
    const isMultiWord = tokens.length > 1;
    if (coords && isMultiWord && !coords.isCountry) {
      try {
        const specificResults = await searchAndFilterPlaces(searchQuery, coords.lat, coords.lon);
        const queryLower = searchQuery.trim().toLowerCase();
        const isExactCityMatch =
          specificResults.length === 1 && specificResults[0].name.toLowerCase() === queryLower;

        if (specificResults.length > 0 && !isExactCityMatch) {
          const best = specificResults[0];
          flyToCenter([best.point.lat, best.point.lon]);
          setPlaces([best]);
          setMode('specific');
          setHasMore(false);
          setOffset(0);
          toast({
            title: "✅ Hely megtalálva",
            description: `${specificResults.length} találat`,
            status: "success",
          });
          return;
        }
      } catch (error) {
        console.warn("Specifikus hely keresés hiba", error);
      }
    }

    if (coords) {
      try {
        flyToCenter([coords.lat, coords.lon]);
        setMode('area');
        setOffset(0);
        await fetchPlaces([coords.lat, coords.lon], selectedCategory, 0, false, mapRadiusRef.current);
        toast({
          title: "✅ Város megtalálva",
          description: `Találatok betöltve`,
          status: "success",
        });
        return;
      } catch (error) {
        console.warn("Város keresés sikertelen", error);
      }
    }

    toast({ title: "Hiba", description: "Nem található a hely/város.", status: "error" });
  };

  const handleFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setMode('area');
    setOffset(0);
    await fetchPlaces(mapCenter, categoryId, 0, false, mapRadiusRef.current);
    const categoryLabel = SEARCH_CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
    toast({ title: "✅ Szűrve", description: `${categoryLabel} betöltve`, status: "info" });
  };

  const handleSelectPlace = (place: Place) => {
    flyToCenter([place.point.lat, place.point.lon]);
    setSelectedPlace(place);
    setMode('specific');
    setHasMore(false);
    setOffset(0);
    setFormTitle(place.name);
    setFormDesc(place.address ?? place.kinds);
    setFormStartTime("09:00");
    setFormEndTime("");
  };

  const selectedTrip = useMemo(
    () => trips.find((t) => t.azonosito === selectedTripId) ?? null,
    [trips, selectedTripId],
  );

  const dayOptions = useMemo(() => {
    if (!selectedTrip) return [];
    const count = calcDayCount(selectedTrip.kezdo_datum, selectedTrip.veg_datum);
    return Array.from({ length: count }, (_, idx) => idx + 1);
  }, [selectedTrip]);

  useEffect(() => {
    if (!selectedTrip) return;
    setSelectedDay(1);
  }, [selectedTripId, selectedTrip]);

  const handleOpenAddModal = async () => {
    addProgramModal.onOpen();
    if (trips.length > 0 || tripsLoading) return;
    setTripsLoading(true);
    try {
      const res = await listUtazasok({ limit: 200, rendez: "datum" });
      setTrips(res.utazasok);
      if (res.utazasok[0]) {
        setSelectedTripId(res.utazasok[0].azonosito);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Ismeretlen hiba";
      toast({ title: "Hiba", description: msg, status: "error" });
    } finally {
      setTripsLoading(false);
    }
  };

  const handleAddProgram = async () => {
    if (!selectedTrip || !selectedTripId || !selectedDay) {
      toast({ title: "Hiányzó adatok", description: "Válassz utazást és napot.", status: "warning" });
      return;
    }
    if (!formTitle.trim() || !formStartTime) {
      toast({ title: "Hiányzó adatok", description: "Adj meg címet és kezdés időt.", status: "warning" });
      return;
    }
    try {
      const napDatum = addDays(selectedTrip.kezdo_datum, Number(selectedDay) - 1);
      await createProgram(Number(selectedTripId), {
        nev: formTitle.trim(),
        leiras: formDesc.trim() ? formDesc.trim() : undefined,
        nap_datum: napDatum,
        kezdo_ido: formStartTime,
        veg_ido: formEndTime || formStartTime,
      });
      toast({ title: "Program hozzáadva", status: "success" });
      addProgramModal.onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Ismeretlen hiba";
      toast({ title: "Hiba", description: msg, status: "error" });
    }
  };

  const handleMapMove = (center: [number, number], radius: number) => {
    setMapCenter(center);
    mapRadiusRef.current = radius;
    if (mode !== 'area') {
      setMode('area');
    }
    setOffset(0);
    setSelectedPlace(null);
    void fetchPlaces(center, selectedCategory, 0, false, radius);
  };

  const handleLoadMore = async () => {
    if (loadingMore || loadingPlaces || mode !== 'area' || !hasMore) return;
    const nextOffset = offset + LIMIT;
    await fetchPlaces(mapCenter, selectedCategory, nextOffset, true, mapRadiusRef.current);
  };

  return (
    <Box position="relative" w="100vw" h="100vh" overflow="hidden">
      
      {/* --- NAVBAR HÁTTÉR --- */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        w="100%" 
        h="120px"
        bgGradient="linear(to-b, rgba(30, 60, 114, 0.9) 0%, rgba(30, 60, 114, 0) 100%)"
        zIndex={5}
        pointerEvents="none"
      />

      {/* --- HÁTTÉR TÉRKÉP (MAPBOX) --- */}
      <Box position="absolute" top="0" left="0" w="100%" h="100%" zIndex={0}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer
            url={getMapboxTileUrl("streets")}
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          />
          <MapUpdater center={mapCenter} shouldFlyRef={shouldFlyRef} />
          <MapMoveHandler onMoveEnd={handleMapMove} radiusRef={mapRadiusRef} />
          
          {places.map((place) => (
            <Marker 
              key={place.xid} 
              position={[place.point.lat, place.point.lon]}
              icon={selectedPlace?.xid === place.xid ? selectedIcon : defaultIcon}
              eventHandlers={{ click: () => handleSelectPlace(place) }}
            >
              <Popup>{place.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* --- UI RÉTEG --- */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        w="100%" 
        h="100%" 
        zIndex={10} 
        pointerEvents="none"
      >
        <Flex 
          w="100%" 
          h="100%" 
          pt={{ base: 24, md: 32 }}
          px={{ base: 4, md: 8 }}
          justify={{ base: "flex-start", lg: "space-between" }}
          align={{ base: "stretch", lg: "flex-start" }}
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 4, lg: 6 }}
        >
          
          {/* BAL PANEL - Lista */}
          <Box 
            w={{ base: "100%", lg: "360px" }}
            // Mobilon alacsonyabb, hogy maradjon hely a térképnek
            h={{
              base: isPanelOpen ? "45vh" : "auto",
              md: isPanelOpen ? "55vh" : "auto",
              lg: "65vh",
            }}
            maxH={{
              base: isPanelOpen ? "50vh" : "none",
              lg: "65vh",
            }}
            {...glassPanelStyle}
            pointerEvents="auto"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            mb={{ base: 4, lg: 0 }} // Margó mobilon
          >
            <Box p={4} borderBottom={isPanelOpen || !isMobile ? "1px solid rgba(0,0,0,0.1)" : "none"}>
              <InputGroup size="md" mb={3}>
                <Input
                  pr="4.5rem"
                  placeholder="Ország, város"
                  bg="white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => isMobile && setIsPanelOpen(true)}
                  onClick={() => isMobile && setIsPanelOpen(true)}
                  borderRadius="full"
                />
                <InputRightElement width="3rem">
                  <IconButton h="1.75rem" size="sm" aria-label="Keresés" icon={<SearchIcon />} onClick={handleSearch} bg="transparent" />
                </InputRightElement>
              </InputGroup>

              {isMobile && (
                <Button
                  variant="ghost"
                  size="xs"
                  rightIcon={<ChevronDownIcon />}
                  onClick={() => setIsPanelOpen((prev) => !prev)}
                >
                  {isPanelOpen ? "Elrejtés" : "Találatok"}
                </Button>
              )}
            </Box>

            <Collapse in={!isMobile || isPanelOpen} animateOpacity>
              <Box px={4} pb={2}>
                <HStack
                  spacing={2}
                  pb={2}
                  flexWrap={{ base: "wrap", md: "nowrap" }}
                  overflowX={{ base: "hidden", md: "auto" }}
                  css={{ '&::-webkit-scrollbar': { display: 'none' } }}
                >
                  {SEARCH_CATEGORIES.map((cat) => (
                    <Button 
                      key={cat.id}
                      size="sm"
                      flexShrink={0}
                      onClick={() => handleFilter(cat.id)} 
                      colorScheme={selectedCategory === cat.id ? "blue" : "gray"}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </HStack>
              </Box>
              <VStack
                flex={1}
                overflowY="auto"
                spacing={0}
                align="stretch"
                p={2}
                maxH={{
                  base: isPanelOpen ? "28vh" : "0",
                  md: isPanelOpen ? "35vh" : "0",
                  lg: "calc(65vh - 130px)",
                }}
                sx={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '8px' } }}
              >
                {loadingPlaces && (
                  <Text fontSize="sm" color="gray.600" p={3}>
                    Betöltés...
                  </Text>
                )}
                {places.map((place) => (
                  <HStack 
                    key={place.xid} 
                    p={3} 
                    borderRadius="lg" 
                    _hover={{ bg: "rgba(255,255,255,0.5)" }} 
                    cursor="pointer"
                    onClick={() => handleSelectPlace(place)}
                    transition="all 0.2s"
                    align="start"
                  >
                    <Image 
                      src={place.image} 
                      fallbackSrc="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
                      boxSize={{ base: "48px", md: "60px" }}
                      objectFit="cover" 
                      borderRadius="md" 
                      alt={place.name}
                      loading="lazy"
                    />
                    <VStack align="start" spacing={0} flex="1" minW={0}>
                      <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{place.name}</Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        {place.kinds}
                      </Text>
                      {place.address && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {place.address}
                        </Text>
                      )}
                      <HStack fontSize="xs" color="gray.500" mt={1}>
                        <TimeIcon />
                        <Text>Népszerű</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                ))}
                {mode === 'area' && hasMore && (
                  <Button
                    mt={2}
                    size="sm"
                    alignSelf="center"
                    onClick={handleLoadMore}
                    isLoading={loadingMore}
                  >
                    További találatok
                  </Button>
                )}
              </VStack>
            </Collapse>
          </Box>

          {/* JOBB PANEL - Kiválasztott hely hozzáadása */}
          {/* Mobilon "Bottom Sheet" stílusban jelenik meg */}
          {selectedPlace && (
            <Box 
              w={{ base: "100%", lg: "450px" }}
              maxH={{ base: "80vh", lg: "none" }}
              overflowY={{ base: "auto", lg: "visible" }}
              {...glassPanelStyle}
              p={{ base: 5, md: 8 }}
              pointerEvents="auto"
              position={{ base: "fixed", lg: "relative" }}
              // Mobilon alulra rögzítve
              bottom={{ base: 0, lg: "auto" }}
              left={{ base: 0, lg: "auto" }}
              right={{ base: 0, lg: "auto" }}
              // Lekerekítés csak felül mobilon
              borderRadius={{ base: "20px 20px 0 0", lg: "20px" }}
              // Margók eltüntetése mobilon
              m={{ base: 0, lg: 0 }}
              zIndex={{ base: 20, lg: "auto" }}
              borderBottom={{ base: "none", lg: "1px solid rgba(255,255,255,0.4)" }}
            >
              <IconButton 
                aria-label="Close" 
                icon={<Text>X</Text>} 
                size="sm" 
                position="absolute" 
                top={4} right={4} 
                onClick={() => setSelectedPlace(null)}
              />

              {selectedPlace.image && (
                <Box mb={4} borderRadius="lg" overflow="hidden" maxH="150px">
                  <Image 
                    src={selectedPlace.image} 
                    fallbackSrc="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
                    w="100%" 
                    h="100%"
                    objectFit="cover" 
                    alt={selectedPlace.name}
                  />
                </Box>
              )}

              <VStack spacing={3} align="stretch">
                <Text fontSize="xs" fontWeight="700" color="#1E2A4F" letterSpacing="0.08em" textTransform="uppercase">
                  Kiválasztott hely
                </Text>

                <Box bg="whiteAlpha.700" borderRadius="lg" p={3} border="1px solid rgba(0,0,0,0.06)">
                  <Text fontSize="md" fontWeight="700" color="#1E2A4F" mb={1}>
                    {selectedPlace.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="600" mb={1}>
                    Cím
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {selectedPlace.address ?? selectedPlace.kinds}
                  </Text>
                  {selectedPlace.kinds && (
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Kategória: {selectedPlace.kinds}
                    </Text>
                  )}
                </Box>

                <Divider />

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Válaszd ki, melyik utazás és nap programjához add hozzá.
                </Text>

                <Stack w="100%" pt={2} spacing={3} direction="row">
                  <Button size="sm" flex={1} bg="white" color="#1E2A4F" onClick={() => setSelectedPlace(null)}>
                    Mégse
                  </Button>
                  <Button size="sm" flex={1} bg="#1E2A4F" color="white" _hover={{ bg: "#151d36" }} onClick={handleOpenAddModal}>
                    Hozzáadás
                  </Button>
                </Stack>
              </VStack>
            </Box>
          )}

          <Modal isOpen={addProgramModal.isOpen} onClose={addProgramModal.onClose} isCentered size={{ base: "sm", md: "md" }}>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl">
              <ModalHeader>Program hozzáadása</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Utazás</FormLabel>
                    <Select
                      placeholder={tripsLoading ? "Betöltés..." : "Válassz utazást"}
                      value={selectedTripId ? String(selectedTripId) : ""}
                      onChange={(e) => setSelectedTripId(Number(e.target.value))}
                      isDisabled={tripsLoading}
                    >
                      {trips.map((trip) => (
                        <option key={trip.azonosito} value={trip.azonosito}>
                          {trip.cim} ({trip.kezdo_datum} - {trip.veg_datum})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nap</FormLabel>
                    <Select
                      placeholder="Válassz napot"
                      value={selectedDay ? String(selectedDay) : ""}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      isDisabled={!selectedTrip}
                    >
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day}. nap
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                    <FormControl isRequired>
                      <FormLabel>Kezdés</FormLabel>
                      <InputGroup size="sm">
                        <Input type="time" bg="white" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} />
                        <InputRightElement><TimeIcon color="gray.500" /></InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Vég</FormLabel>
                      <InputGroup size="sm">
                        <Input type="time" bg="white" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} />
                        <InputRightElement><TimeIcon color="gray.500" /></InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </Stack>

                  <FormControl isRequired>
                    <FormLabel>Cím</FormLabel>
                    <Input bg="white" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Leírás</FormLabel>
                    <Textarea bg="white" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={addProgramModal.onClose} mr={3}>
                  Mégse
                </Button>
                <Button colorScheme="blue" onClick={handleAddProgram}>
                  Mentés
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

        </Flex>
      </Box>
    </Box>
  );
};

export default TerkepOldal;
