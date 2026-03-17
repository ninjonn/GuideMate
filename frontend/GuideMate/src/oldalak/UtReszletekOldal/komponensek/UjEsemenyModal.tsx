import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack,
} from '@chakra-ui/react';

type UjEsemenyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editingEventId: number | null;
  title: string;
  description: string;
  timeStart: string;
  timeEnd: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTimeStartChange: (value: string) => void;
  onTimeEndChange: (value: string) => void;
  onSave: () => void;
};

const UjEsemenyModal: React.FC<UjEsemenyModalProps> = ({
  isOpen,
  onClose,
  editingEventId,
  title,
  description,
  timeStart,
  timeEnd,
  onTitleChange,
  onDescriptionChange,
  onTimeStartChange,
  onTimeEndChange,
  onSave,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'xs', md: 'md' }}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader>{editingEventId ? 'Szerkesztés' : 'Új program'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Cím</FormLabel>
              <Input value={title} onChange={(e) => onTitleChange(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Leírás</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={3}
              />
            </FormControl>
            <HStack>
              <FormControl>
                <FormLabel>Kezdés</FormLabel>
                <Input type="time" value={timeStart} onChange={(e) => onTimeStartChange(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Vég</FormLabel>
                <Input type="time" value={timeEnd} onChange={(e) => onTimeEndChange(e.target.value)} />
              </FormControl>
            </HStack>
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

export default UjEsemenyModal;
