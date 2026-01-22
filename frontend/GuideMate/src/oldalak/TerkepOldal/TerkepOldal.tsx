import React, { useState, useEffect } from 'react';
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

const glassPanelStyle = {
  bg: "rgba(255, 255, 255, 0.6)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
  borderRadius: "20px",
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

const TerkepOldal: React.FC = () => {
  const toast = useToast();
  
  const [searchQuery, setSearchQuery] = useState("Párizs");
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("interesting_places");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");

  // KERESÉS - intelligent (város vagy specifikus)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Hiba", description: "Írj be valamit!", status: "error" });
      return;
    }

    // Előbb próbáljuk meg VÁROS KERESÉSKÉNT
    try {
      const coords = await getCoordinates(searchQuery);
      setMapCenter([coords.lat, coords.lon]);
      
      // VÁROS ESETÉN: Népszerű kategória helyeit keressük
      const items = await getPlaces(coords.lat, coords.lon, selectedCategory);
      setPlaces(items);
      
      toast({ 
        title: "✅ Város megtalálva", 
        description: `${items.length} hely található!`, 
        status: "success" 
      });
      return;
    } catch (error) {
      // Ha város keresés nem működött, próbáljuk specifikus helyként
      console.log("Város keresés nem sikerült, próbálom specifikus helyként...");
    }

    // Ha VÁROS keresés nem sikerült → SPECIFIKUS HELY
    try {
      const specificResults = await searchAndFilterPlaces(searchQuery, mapCenter[0], mapCenter[1]);
      if (specificResults.length > 0) {
        setMapCenter([specificResults[0].point.lat, specificResults[0].point.lon]);
        setPlaces(specificResults);
        toast({ 
          title: "✅ Hely megtalálva", 
          description: `${specificResults.length} találat`, 
          status: "success" 
        });
        return;
      }
    } catch (error) {
      toast({ title: "❌ Hiba", description: "Nem található.", status: "error" });
    }
  };

  const handleFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    const items = await getPlaces(mapCenter[0], mapCenter[1], categoryId);
    setPlaces(items);
    const categoryLabel = SEARCH_CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
    toast({ title: "✅ Szűrve", description: `${items.length} ${categoryLabel}`, status: "info" });
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setFormTitle(place.name);
    setFormDesc(place.kinds);
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <MapUpdater center={mapCenter} />
          
          {places.map((place) => (
            <Marker 
              key={place.xid} 
              position={[place.point.lat, place.point.lon]}
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
