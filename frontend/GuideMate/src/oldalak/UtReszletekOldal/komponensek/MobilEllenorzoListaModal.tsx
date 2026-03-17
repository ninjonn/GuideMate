import React from 'react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import EllenorzoListaPanel from './EllenorzoListaPanel';
import type { ChecklistItem } from '../utReszletek.types';

type MobilEllenorzoListaModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: ChecklistItem[];
  onToggle: (id: number) => void;
  onAdd: () => void;
  onDeleteChecked: () => void;
};

const MobilEllenorzoListaModal: React.FC<MobilEllenorzoListaModalProps> = ({
  isOpen,
  onOpen,
  onClose,
  items,
  onToggle,
  onAdd,
  onDeleteChecked,
}) => {
  return (
    <>
      <IconButton
        aria-label="Ellenőrzőlista megnyitása"
        icon={<CheckIcon />}
        isRound
        size="lg"
        bg="#F6C95C"
        color="#1E2A4F"
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={100}
        shadow="xl"
        display={{ base: 'flex', lg: 'none' }}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent
          bg="#F6C95C"
          borderRadius="2xl"
          boxShadow="xl"
          maxH="80vh"
          overflow="hidden"
        >
          <ModalHeader color="#1E2A4F" textAlign="center">
            Ellenőrzőlista
          </ModalHeader>
          <ModalCloseButton color="#1E2A4F" />
          <ModalBody pb={6} overflowY="auto">
            <EllenorzoListaPanel
              items={items}
              isMobileView={true}
              onToggle={onToggle}
              onAdd={onAdd}
              onDeleteChecked={onDeleteChecked}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MobilEllenorzoListaModal;
