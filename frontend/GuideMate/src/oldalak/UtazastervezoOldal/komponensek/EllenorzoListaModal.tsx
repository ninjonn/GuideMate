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

type EllenorzoListaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
};

const EllenorzoListaModal: React.FC<EllenorzoListaModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(5px)" bg="rgba(255,0,0,0.15)" />
      <ModalContent bg="white" borderRadius="20px" boxShadow="xl">
        <ModalHeader color="#232B5C">Új elem hozzáadása</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Pl. Naptej"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            focusBorderColor="#232B5C"
            size="lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onConfirm();
              }
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Mégse
          </Button>
          <Button bg="#232B5C" color="white" _hover={{ bg: '#1a214d' }} onClick={onConfirm}>
            Hozzáadás
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EllenorzoListaModal;
