import { useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SEARCH_CATEGORIES,
  getCoordinates,
  getMapboxTileUrl,
  getPlaces,
  searchAndFilterPlaces,
  type CoordinatesResult,
  type Place,
} from '../../lib/opentripmap';
import { listUtazasok, type UtazasListItem } from '../../features/utazas/utazas.api';
import { createProgram } from '../../features/program/program.api';
import { addDays, calcDayCount } from './terkep.utils';
import { DEFAULT_RADIUS, LIMIT } from './terkep.constants';

export const useTerkepOldal = () => {
  const toast = useToast();
  const addProgramModal = useDisclosure();

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

  const flyToCenter = (center: [number, number]) => {
    shouldFlyRef.current = true;
    setMapCenter(center);
  };

  const fetchPlaces = async (
    center: [number, number],
    categoryId: string,
    nextOffset = 0,
    append = false,
    radiusOverride?: number,
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

    if (coords && !coords.isCountry) {
      try {
        const specificResults = await searchAndFilterPlaces(
          searchQuery,
          coords.lat,
          coords.lon,
        );
        const areaTypes = ['city', 'administrative', 'town', 'village', 'hamlet', 'suburb'];
        const isCity = specificResults.length === 1 &&
          areaTypes.includes(specificResults[0].kinds);

        if (specificResults.length > 0 && !isCity) {
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
    const categoryLabel = SEARCH_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
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

  return {
    search: {
      query: searchQuery,
      setQuery: setSearchQuery,
    },
    map: {
      center: mapCenter,
      places,
      selectedCategory,
      selectedPlace,
      setSelectedPlace,
      mode,
      hasMore,
      loadingPlaces,
      loadingMore,
      shouldFlyRef,
      mapRadiusRef,
      getMapboxTileUrl,
    },
    panel: {
      isPanelOpen,
      setIsPanelOpen,
    },
    form: {
      title: formTitle,
      desc: formDesc,
      startTime: formStartTime,
      endTime: formEndTime,
      setTitle: setFormTitle,
      setDesc: setFormDesc,
      setStartTime: setFormStartTime,
      setEndTime: setFormEndTime,
    },
    trips: {
      list: trips,
      loading: tripsLoading,
      selectedTripId,
      setSelectedTripId,
      selectedDay,
      setSelectedDay,
      dayOptions,
    },
    modals: {
      addProgramModal,
    },
    actions: {
      handleSearch,
      handleFilter,
      handleSelectPlace,
      handleOpenAddModal,
      handleAddProgram,
      handleMapMove,
      handleLoadMore,
    },
  };
};
