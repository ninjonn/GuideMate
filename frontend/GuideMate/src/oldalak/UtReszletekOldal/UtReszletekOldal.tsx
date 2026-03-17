import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  Stack,
  Flex,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import NapFul from './komponensek/NapFul';
import Idovonal from './komponensek/Idovonal';
import UjEsemenyModal from './komponensek/UjEsemenyModal';
import EllenorzoListaPanel from './komponensek/EllenorzoListaPanel';
import EllenorzoListaUjElemModal from './komponensek/EllenorzoListaUjElemModal';
import MobilEllenorzoListaModal from './komponensek/MobilEllenorzoListaModal';
import { glassButtonStyle, glassStyleCommon } from './utReszletek.styles';
import { useUtReszletek } from './useUtReszletek';

const UtReszletekOldal: React.FC = () => {
  const {
    tripTitle,
    days,
    activeDay,
    setActiveDay,
    sortedEvents,
    totalDurationString,
    checklist,
    newEventTitle,
    newEventStart,
    newEventEnd,
    newEventDescription,
    editingEventId,
    newItemName,
    daysScrollRef,
    exportRef,
    eventModal,
    checklistAddModal,
    mobileChecklistModal,
    setNewEventTitle,
    setNewEventStart,
    setNewEventEnd,
    setNewEventDescription,
    setNewItemName,
    handleBack,
    handleAddDay,
    handleDeleteDaysFrom,
    handleOpenNewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleSaveEvent,
    handleToggleCheck,
    handleAddChecklistItem,
    confirmAddChecklistItem,
    handleDeleteChecked,
    handleExportDay,
  } = useUtReszletek();

  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      pt={{ base: 20, md: 32 }}
      pb={10}
      overflowX="hidden"
    >
      <Container maxW="1200px" px={{ base: 4, md: 8 }} ref={exportRef}>
        
        <Flex direction={{ base: "column", lg: "row" }} gap={10} align="flex-start">
          
          {/* === BAL OSZLOP (Timeline + Gombok) === */}
          <Box flex="2" w="100%">
            <VStack align="start" spacing={6} w="100%">
              <Heading size={{ base: "xl", md: "3xl" }} fontWeight="700" textAlign={{ base: "center", md: "left" }} w="100%">
                {tripTitle}
              </Heading>
              
              <NapFul
                days={days}
                activeDay={activeDay}
                onSelectDay={setActiveDay}
                onExport={() => void handleExportDay()}
                onDeleteDays={() => void handleDeleteDaysFrom(days.length)}
                daysScrollRef={daysScrollRef}
              />

              {/* IDŐTARTAM KÁRTYA (MOBIL NÉZETBEN) */}
              <Box 
                display={{ base: "block", lg: "none" }} 
                bg="white" 
                borderRadius="xl" 
                p={4} 
                color="#2D3748" 
                boxShadow="lg" 
                w="100%" 
                textAlign="center"
              >
                <Heading size="xs" color="#1E2A4F" mb={1} textTransform="uppercase">Időtartam összesen</Heading>
                <Text fontSize="xl" fontWeight="bold" mb={2}>{totalDurationString}</Text>
                <Divider mb={2} />
                <Text fontSize="xs" color="gray.500">Tervek: <Text as="span" fontWeight="bold" color="#1E2A4F">{sortedEvents.length} elem</Text></Text>
              </Box>

              <Stack
                spacing={3}
                w="100%"
                mb={4}
                direction={{ base: "column", md: "row" }}
                data-export-hide
              >
                <Button {...glassButtonStyle} w={{ base: "100%", md: "180px" }} onClick={handleBack}>Visszalépés</Button>
                <Button bg="#1E2A4F" color="white" w={{ base: "100%", md: "auto" }} _hover={{ bg: "#151d36" }} onClick={handleAddDay} px={6}>+ új nap hozzáadása</Button>
                <Button bg="#3B49DF" color="white" w={{ base: "100%", md: "auto" }} _hover={{ bg: "#2b36a8" }} onClick={handleOpenNewEvent} rightIcon={<ChevronDownIcon />} px={6}>+ új esemény</Button>
              </Stack>

              <Idovonal
                events={sortedEvents}
                onEdit={handleEditEvent}
                onDelete={(eventId) => void handleDeleteEvent(eventId)}
              />

            </VStack>
          </Box>

          {/* === JOBB OSZLOP (Csak Desktopon) === */}
          <Box display={{ base: "none", lg: "block" }} flex="1" w="100%">
            <VStack spacing={6} align="stretch">
              <Box {...glassStyleCommon} p={6}>
                <Box bg="#F7FAFC" borderRadius="xl" p={6} color="#2D3748" boxShadow="sm">
                  <Heading size="sm" color="#1E2A4F" mb={2}>Időtartam összesen</Heading>
                  <Text fontSize="md" color="gray.500" mb={4}>{totalDurationString}</Text>
                  <Divider borderColor="gray.300" mb={4} />
                  <Text fontSize="sm" color="gray.500">Tervek</Text>
                  <Text fontSize="lg" fontWeight="600" color="#1E2A4F">{sortedEvents.length} elem</Text>
                </Box>
              </Box>

              <Box {...glassStyleCommon} p={6} w="100%">
                <Heading size="lg" mb={4} textAlign="center" color="white">Ellenőrzőlista</Heading>
                <EllenorzoListaPanel
                  items={checklist}
                  onToggle={handleToggleCheck}
                  onAdd={handleAddChecklistItem}
                  onDeleteChecked={handleDeleteChecked}
                />
              </Box>
            </VStack>
          </Box>

        </Flex>
      </Container>

      <MobilEllenorzoListaModal
        isOpen={mobileChecklistModal.isOpen}
        onOpen={mobileChecklistModal.onOpen}
        onClose={mobileChecklistModal.onClose}
        items={checklist}
        onToggle={handleToggleCheck}
        onAdd={handleAddChecklistItem}
        onDeleteChecked={handleDeleteChecked}
      />

      <UjEsemenyModal
        isOpen={eventModal.isOpen}
        onClose={eventModal.onClose}
        editingEventId={editingEventId}
        title={newEventTitle}
        description={newEventDescription}
        timeStart={newEventStart}
        timeEnd={newEventEnd}
        onTitleChange={setNewEventTitle}
        onDescriptionChange={setNewEventDescription}
        onTimeStartChange={setNewEventStart}
        onTimeEndChange={setNewEventEnd}
        onSave={() => void handleSaveEvent()}
      />

      <EllenorzoListaUjElemModal
        isOpen={checklistAddModal.isOpen}
        onClose={checklistAddModal.onClose}
        value={newItemName}
        onChange={setNewItemName}
        onConfirm={() => void confirmAddChecklistItem()}
      />

    </Box>
  );
};

export default UtReszletekOldal;
