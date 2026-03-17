import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';

export type ProfileDraft = {
  vezeteknev: string;
  keresztnev: string;
  email: string;
};

export type PasswordDraft = {
  regi: string;
  uj: string;
};

type ProfilSzerkesztesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  draft: ProfileDraft;
  onDraftChange: (next: ProfileDraft) => void;
  onSave: () => void;
  isSaving: boolean;
};

type JelszoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  draft: PasswordDraft;
  onDraftChange: (next: PasswordDraft) => void;
  onSave: () => void;
  isSaving: boolean;
};

export const ProfilSzerkesztesModal: React.FC<ProfilSzerkesztesModalProps> = ({
  isOpen,
  onClose,
  draft,
  onDraftChange,
  onSave,
  isSaving,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader>Profil szerkesztése</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Vezetéknév</FormLabel>
              <Input
                value={draft.vezeteknev}
                onChange={(e) => onDraftChange({ ...draft, vezeteknev: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Keresztnév</FormLabel>
              <Input
                value={draft.keresztnev}
                onChange={(e) => onDraftChange({ ...draft, keresztnev: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => onDraftChange({ ...draft, email: e.target.value })}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Mégse
          </Button>
          <Button colorScheme="blue" onClick={onSave} isLoading={isSaving}>
            Mentés
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const JelszoModal: React.FC<JelszoModalProps> = ({
  isOpen,
  onClose,
  draft,
  onDraftChange,
  onSave,
  isSaving,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader>Jelszó módosítása</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Régi jelszó</FormLabel>
              <Input
                type="password"
                value={draft.regi}
                onChange={(e) => onDraftChange({ ...draft, regi: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Új jelszó</FormLabel>
              <Input
                type="password"
                value={draft.uj}
                onChange={(e) => onDraftChange({ ...draft, uj: e.target.value })}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Mégse
          </Button>
          <Button colorScheme="blue" onClick={onSave} isLoading={isSaving}>
            Mentés
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
