import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import type { UtazasListItem } from '../../../features/utazas/utazas.api';

type UtHozzaadasaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trips: UtazasListItem[];
  tripsLoading: boolean;
  selectedTripId: number | '';
  onSelectTrip: (id: number | '') => void;
  selectedDay: number | '';
  onSelectDay: (day: number | '') => void;
  dayOptions: number[];
  formTitle: string;
  formDesc: string;
  formStartTime: string;
  formEndTime: string;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSave: () => void;
};

const UtHozzaadasaModal: React.FC<UtHozzaadasaModalProps> = ({
  isOpen,
  onClose,
  trips,
  tripsLoading,
  selectedTripId,
  onSelectTrip,
  selectedDay,
  onSelectDay,
  dayOptions,
  formTitle,
  formDesc,
  formStartTime,
  formEndTime,
  onTitleChange,
  onDescChange,
  onStartTimeChange,
  onEndTimeChange,
  onSave,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'sm', md: 'md' }}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader>Program hozzáadása</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Utazás</FormLabel>
              <Select
                placeholder={tripsLoading ? 'Betöltés...' : 'Válassz utazást'}
                value={selectedTripId ? String(selectedTripId) : ''}
                onChange={(e) => onSelectTrip(Number(e.target.value))}
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
                value={selectedDay ? String(selectedDay) : ''}
                onChange={(e) => onSelectDay(Number(e.target.value))}
                isDisabled={!selectedTripId}
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}. nap
                  </option>
                ))}
              </Select>
            </FormControl>

            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
              <FormControl isRequired>
                <FormLabel>Kezdés</FormLabel>
                <InputGroup size="sm">
                  <Input type="time" bg="white" value={formStartTime} onChange={(e) => onStartTimeChange(e.target.value)} />
                  <InputRightElement>
                    <TimeIcon color="gray.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Vég</FormLabel>
                <InputGroup size="sm">
                  <Input type="time" bg="white" value={formEndTime} onChange={(e) => onEndTimeChange(e.target.value)} />
                  <InputRightElement>
                    <TimeIcon color="gray.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Stack>

            <FormControl isRequired>
              <FormLabel>Cím</FormLabel>
              <Input bg="white" value={formTitle} onChange={(e) => onTitleChange(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Leírás</FormLabel>
              <Textarea bg="white" value={formDesc} onChange={(e) => onDescChange(e.target.value)} rows={3} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Mégse
          </Button>
          <Button colorScheme="blue" onClick={onSave}>
            Mentés
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UtHozzaadasaModal;
