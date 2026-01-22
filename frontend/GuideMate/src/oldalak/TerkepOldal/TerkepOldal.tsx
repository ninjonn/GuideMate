import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
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
} from '@chakra-ui/react';
import { SearchIcon, TimeIcon } from '@chakra-ui/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  getCoordinates, 
  getPlaces,
  searchAndFilterPlaces,
  getMapboxTileUrl, 
  SEARCH_CATEGORIES,
  type Place 
} from '../../lib/opentripmap';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
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
    map.flyTo(center, 13);
    shouldFlyRef.current = false;
  }, [center, map, shouldFlyRef]);
  return null;
}

function MapMoveHandler({
  onMoveEnd,
  suppressRef,
}: {
  onMoveEnd: (center: [number, number]) => void;
  suppressRef: React.MutableRefObject<boolean>;
}) {
  useMapEvents({
    moveend: (event) => {
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      const center = event.target.getCenter();
      onMoveEnd([center.lat, center.lng]);
    },
  });
  return null;
}

const TerkepOldal: React.FC = () => {
  const toast = useToast();
  
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

  const shouldFlyRef = useRef(false);
  const suppressNextMoveRef = useRef(false);
  const LIMIT = 30;
  const RADIUS = 8000;

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const flyToCenter = (center: [number, number]) => {
    shouldFlyRef.current = true;
    suppressNextMoveRef.current = true;
    setMapCenter(center);
  };

  const fetchPlaces = async (
    center: [number, number],
    categoryId: string,
    nextOffset = 0,
    append = false
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingPlaces(true);
      }
      const result = await getPlaces(center[0], center[1], categoryId, {
        limit: LIMIT,
        offset: nextOffset,
        radius: RADIUS,
      });
      const normalized = Array.isArray(result.items) ? result.items : [];

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
      const msg = error instanceof Error ? error.message : "Ismeretlen hiba";
      toast({ title: "Hiba", description: msg, status: "error" });
    } finally {
      setLoadingPlaces(false);
      setLoadingMore(false);
    }
  };

  // KERESÉS - intelligens (specifikus hely először, különben város + lista)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Hiba", description: "Írj be valamit!", status: "error" });
      return;
    }

    // 1) Geokód: város vagy általános koordináta a keresőkifejezésre
    let coords: { lat: number; lon: number } | null = null;
    try {
      coords = await getCoordinates(searchQuery);
    } catch (error) {
      console.warn("Geokód sikertelen, specifikus hely keresés nélkülözheti a koordinátát", error);
    }

    // 2) Specifikus hely keresése (pl. Louvre, Trófea étterem) csak ha van koordináta és több szavas kifejezés
    const tokens = searchQuery.trim().split(/\s+/);
    const isMultiWord = tokens.length > 1;
    if (coords && isMultiWord) {
      try {
        const specificResults = await searchAndFilterPlaces(searchQuery, coords.lat, coords.lon);
        const queryLower = searchQuery.trim().toLowerCase();
        const isExactCityMatch =
          specificResults.length === 1 && specificResults[0].name.toLowerCase() === queryLower;

        if (specificResults.length > 0 && !isExactCityMatch) {
          // Csak a legjobb találatot mutatjuk, mint a Google Maps kereső.
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

    // 3) Általános városi lista a kiválasztott kategóriával
    if (coords) {
      try {
        flyToCenter([coords.lat, coords.lon]);
        setMode('area');
        setOffset(0);
        await fetchPlaces([coords.lat, coords.lon], selectedCategory, 0, false);
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

    // 4) Ha semmi nem sikerült
    toast({ title: "Hiba", description: "Nem található a hely/város.", status: "error" });
  };

  const handleFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setMode('area');
    setOffset(0);
    await fetchPlaces(mapCenter, categoryId, 0, false);
    const categoryLabel = SEARCH_CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
    toast({ title: "✅ Szűrve", description: `${categoryLabel} betöltve`, status: "info" });
  };

  const handleSelectPlace = (place: Place) => {
    // Ugrás a kiválasztott pontra és az űrlap előtöltése címmel
    flyToCenter([place.point.lat, place.point.lon]);
    setSelectedPlace(place);
    setMode('specific');
    setHasMore(false);
    setOffset(0);
    setFormTitle(place.name);
    setFormDesc(place.address ?? place.kinds);
  };

  const handleMapMove = (center: [number, number]) => {
    setMapCenter(center);
    if (mode !== 'area') {
      setMode('area');
    }
    setOffset(0);
    setSelectedPlace(null);
    void fetchPlaces(center, selectedCategory, 0, false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || loadingPlaces || mode !== 'area' || !hasMore) return;
    const nextOffset = offset + LIMIT;
    await fetchPlaces(mapCenter, selectedCategory, nextOffset, true);
  };

  // Nincs automatikus keresés; a felhasználó indítja.

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
          <MapMoveHandler onMoveEnd={handleMapMove} suppressRef={suppressNextMoveRef} />
          
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
      <Box position="absolute" top="0" left="0" w="100%" h="100%" zIndex={10} pointerEvents="none">
        <Flex 
          w="100%" h="100%" 
          pt={{ base: 28, md: 32 }}
          px={8} 
          justify="space-between" 
          align="flex-start"
        >
          
          {/* BAL PANEL */}
          <Box 
            w="350px" 
            h="calc(100vh - 150px)" 
            {...glassPanelStyle}
            pointerEvents="auto"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Box p={4} borderBottom="1px solid rgba(0,0,0,0.1)">
              <InputGroup size="md" mb={3}>
                <Input
                  pr="4.5rem"
                  placeholder="Ország, város"
                  bg="white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  borderRadius="full"
                />
                <InputRightElement width="3rem">
                  <IconButton h="1.75rem" size="sm" aria-label="Keresés" icon={<SearchIcon />} onClick={handleSearch} bg="transparent" />
                </InputRightElement>
              </InputGroup>

              <HStack spacing={2} overflowX="auto" pb={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                {SEARCH_CATEGORIES.map((cat) => (
                  <Button 
                    key={cat.id}
                    size="sm" 
                    onClick={() => handleFilter(cat.id)} 
                    colorScheme={selectedCategory === cat.id ? "blue" : "gray"}
                  >
                    {cat.label}
                  </Button>
                ))}
              </HStack>
            </Box>

            <VStack flex={1} overflowY="auto" spacing={0} align="stretch" p={2}>
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
                    boxSize="60px" 
                    objectFit="cover" 
                    borderRadius="md" 
                    alt={place.name}
                    loading="lazy"
                  />
                  <VStack align="start" spacing={0} maxW="70%">
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
          </Box>

          {/* JOBB PANEL */}
          {selectedPlace && (
            <Box 
              w="450px" 
              {...glassPanelStyle}
              p={8}
              pointerEvents="auto"
              position="relative"
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
                <Box mb={4} borderRadius="lg" overflow="hidden">
                  <Image 
                    src={selectedPlace.image} 
                    fallbackSrc="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
                    w="100%" 
                    h="200px" 
                    objectFit="cover" 
                    alt={selectedPlace.name}
                  />
                </Box>
              )}

              <Heading size="lg" textAlign="center" color="#1E2A4F" mb={6}>
                Út hozzáadása
              </Heading>

              <VStack spacing={4}>
                <HStack w="100%" spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold">Cím</FormLabel>
                    <Input bg="white" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold">Leírás <Text as="span" fontSize="xs" color="gray.500">*opcionális</Text></FormLabel>
                    <Input bg="white" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                  </FormControl>
                </HStack>

                <HStack w="100%" spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold">Kezdés</FormLabel>
                    <InputGroup>
                      <Input type="time" bg="white" defaultValue="12:00" />
                      <InputRightElement><TimeIcon color="gray.500" /></InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold">Vég <Text as="span" fontSize="xs" color="gray.500">*opcionális</Text></FormLabel>
                    <InputGroup>
                      <Input type="time" bg="white" defaultValue="14:00" />
                      <InputRightElement><TimeIcon color="gray.500" /></InputRightElement>
                    </InputGroup>
                  </FormControl>
                </HStack>

                <HStack w="100%" pt={4} spacing={4}>
                  <Button flex={1} bg="white" color="#1E2A4F" onClick={() => setSelectedPlace(null)}>
                    Mégse
                  </Button>
                  <Button flex={1} bg="#1E2A4F" color="white" _hover={{ bg: "#151d36" }}>
                    Hozzáadás
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}

        </Flex>
      </Box>
    </Box>
  );
};

export default TerkepOldal;
