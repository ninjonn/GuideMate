import React, { useEffect } from 'react';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import 'leaflet/dist/leaflet.css';

import HelyKereses from './komponensek/HelyKereses';
import UtHozzaadasaModal from './komponensek/UtHozzaadasaModal';
import KivalasztottHelyKartya from './komponensek/KivalasztottHelyKartya';
import TerkepNezet from './komponensek/TerkepNezet';
import { SEARCH_CATEGORIES } from '../../lib/opentripmap';
import { glassPanelStyle } from './terkep.constants';
import { useTerkepOldal } from './useTerkepOldal';

const TerkepOldal: React.FC = () => {
  const { search, map, panel, form, trips, modals, actions } = useTerkepOldal();
  const { setIsPanelOpen } = panel;

  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;

  useEffect(() => {
    if (isMobile) {
      setIsPanelOpen(false);
    } else {
      setIsPanelOpen(true);
    }
  }, [isMobile, setIsPanelOpen]);

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
        <TerkepNezet
          center={map.center}
          tileUrl={map.getMapboxTileUrl('streets')}
          places={map.places}
          selectedPlace={map.selectedPlace}
          onSelectPlace={actions.handleSelectPlace}
          onMoveEnd={actions.handleMapMove}
          shouldFlyRef={map.shouldFlyRef}
          radiusRef={map.mapRadiusRef}
        />
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
          
          <HelyKereses
            searchQuery={search.query}
            onSearchQueryChange={search.setQuery}
            onSearch={() => {
              if (isMobile) {
                setIsPanelOpen(true);
              }
              void actions.handleSearch();
            }}
            isMobile={isMobile}
            isPanelOpen={panel.isPanelOpen}
            onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
            onOpenPanel={() => setIsPanelOpen(true)}
            selectedCategory={map.selectedCategory}
            categories={SEARCH_CATEGORIES}
            onFilter={actions.handleFilter}
            places={map.places}
            loadingPlaces={map.loadingPlaces}
            hasMore={map.hasMore}
            mode={map.mode}
            loadingMore={map.loadingMore}
            onSelectPlace={actions.handleSelectPlace}
            onLoadMore={actions.handleLoadMore}
            panelStyle={glassPanelStyle}
          />

          {/* JOBB PANEL - Kiválasztott hely hozzáadása */}
          {/* Mobilon "Bottom Sheet" stílusban jelenik meg */}
          {map.selectedPlace && (
            <KivalasztottHelyKartya
              place={map.selectedPlace}
              onClose={() => map.setSelectedPlace(null)}
              onAdd={actions.handleOpenAddModal}
              panelStyle={glassPanelStyle}
            />
          )}

          <UtHozzaadasaModal
            isOpen={modals.addProgramModal.isOpen}
            onClose={modals.addProgramModal.onClose}
            trips={trips.list}
            tripsLoading={trips.loading}
            selectedTripId={trips.selectedTripId}
            onSelectTrip={trips.setSelectedTripId}
            selectedDay={trips.selectedDay}
            onSelectDay={trips.setSelectedDay}
            dayOptions={trips.dayOptions}
            formTitle={form.title}
            formDesc={form.desc}
            formStartTime={form.startTime}
            formEndTime={form.endTime}
            onTitleChange={form.setTitle}
            onDescChange={form.setDesc}
            onStartTimeChange={form.setStartTime}
            onEndTimeChange={form.setEndTime}
            onSave={actions.handleAddProgram}
          />

        </Flex>
      </Box>
    </Box>
  );
};

export default TerkepOldal;
