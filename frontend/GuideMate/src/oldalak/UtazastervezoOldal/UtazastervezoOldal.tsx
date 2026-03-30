import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Grid,
  SimpleGrid,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import UtKartya from './komponensek/UtKartya';
import EllenorzoListaPanel from './komponensek/EllenorzoListaPanel';
import EllenorzoListaModal from './komponensek/EllenorzoListaModal';
import { glassStyle } from './utazastervezo.styles';
import { useUtazastervezo } from './useUtazastervezo';

const UtazastervezoOldal: React.FC = () => {
  const {
    checklistModal,
    checklist,
    trips,
    loadingTrips,
    loadError,
    newItemName,
    setNewItemName,
    handleEditTrip,
    handleOpenTrip,
    handleDeleteTrip,
    handleToggleItem,
    handleAddItemClick,
    confirmAddItem,
    handleDeleteChecked,
    handleSaveChecklist,
    handleAddTripClick,
    activeTripId,
    setActiveTripId,
  } = useUtazastervezo();

  return (
    <Box
      minH="100vh"
      w="100%"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      pt={{ base: 24, md: 32 }}
      pb={10}
      overflowX="hidden"
    >
      <Container maxW="1400px">
        
        <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
          
          {/* --- BAL OSZLOP: Utazó ellenőrzőlista --- */}
          <EllenorzoListaPanel
            checklist={checklist}
            trips={trips}
            activeTripId={activeTripId}
            onTripChange={setActiveTripId}
            onToggleItem={handleToggleItem}
            onAddItem={handleAddItemClick}
            onDeleteChecked={handleDeleteChecked}
            onSave={handleSaveChecklist}
            glassStyle={glassStyle}
          />

          {/* --- JOBB OSZLOP: Utazások listája + Új út form --- */}
          <Box>
            <Box mb={8}>
              <Heading size="2xl" mb={2} fontWeight="700">Utazástervezés</Heading>
              <Text fontSize="lg" opacity={0.9} maxW="600px" mb={5}>
                Hozz létre utazásokat és állíts össze ellenőrzőlistát, hogy ne felejts el semmit
              </Text>
              
              <Button
                leftIcon={<AddIcon />}
                bg="#232B5C"
                color="white"
                size="lg"
                px={8}
                borderRadius="lg"
                _hover={{ bg: "#1a214d", transform: "scale(1.02)" }}
                transition="all 0.2s"
                boxShadow="lg"
                onClick={handleAddTripClick}
              >
                új út hozzáadása
              </Button>
            </Box>

            {/* Kártyák Grid */}
            {loadError && (
              <Text color="red.100" mb={4}>
                {loadError}
              </Text>
            )}
            {loadingTrips ? (
              <Text color="whiteAlpha.900">Betöltés...</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {trips.map((trip) => (
                  <UtKartya
                    key={trip.id}
                    trip={trip}
                    onOpen={handleOpenTrip}
                    onEdit={handleEditTrip}
                    onDelete={handleDeleteTrip}
                    glassStyle={glassStyle}
                  />
                ))}
              </SimpleGrid>
            )}
          </Box>

        </Grid>
      </Container>

      {/* --- MODAL 1: Checklist Elem Hozzáadása --- */}
      <EllenorzoListaModal
        isOpen={checklistModal.isOpen}
        onClose={checklistModal.onClose}
        value={newItemName}
        onChange={setNewItemName}
        onConfirm={confirmAddItem}
      />

    </Box>
  );
};

export default UtazastervezoOldal;
