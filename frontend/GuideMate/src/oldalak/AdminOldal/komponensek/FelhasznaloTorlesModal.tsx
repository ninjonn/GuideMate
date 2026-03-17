import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

type FelhasznaloTorlesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name?: string;
  email?: string;
};

const FelhasznaloTorlesModal: React.FC<FelhasznaloTorlesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  email,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Felhasználó törlése</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={2} align="start">
            <Text>Biztosan törlöd ezt a felhasználót?</Text>
            {name && <Text fontWeight="600">{name}</Text>}
            {email && <Text fontSize="sm" color="gray.500">{email}</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Mégse
          </Button>
          <Button colorScheme="red" onClick={onConfirm}>
            Törlés
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FelhasznaloTorlesModal;
