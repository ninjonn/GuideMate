import React from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

type EllenorzoListaUjElemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
};

const EllenorzoListaUjElemModal: React.FC<EllenorzoListaUjElemModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'xs', md: 'md' }}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader>Új elem</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Pl. Naptej"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Mégse
          </Button>
          <Button colorScheme="blue" onClick={onConfirm}>
            Hozzáadás
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EllenorzoListaUjElemModal;
