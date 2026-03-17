import React from 'react';
import { Badge, Box, Button, Flex, Heading, HStack, Text, useDisclosure } from '@chakra-ui/react';
import type { AdminUserListItem } from '../../../features/admin/admin.api';
import { glassCardStyle } from '../admin.styles';
import SzerepkorValtas from './SzerepkorValtas';
import FelhasznaloTorlesModal from './FelhasznaloTorlesModal';

type AdminFelhasznaloKartyaProps = {
  user: AdminUserListItem;
  onRoleChange: (user: AdminUserListItem) => void;
  onDelete: (user: AdminUserListItem) => void;
};

const AdminFelhasznaloKartya: React.FC<AdminFelhasznaloKartyaProps> = ({
  user,
  onRoleChange,
  onDelete,
}) => {
  const deleteModal = useDisclosure();

  const handleConfirmDelete = () => {
    onDelete(user);
    deleteModal.onClose();
  };

  return (
    <Box {...glassCardStyle} p={5}>
      <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="md">{user.nev}</Heading>
          <Text opacity={0.8}>{user.email}</Text>
          <HStack spacing={2} mt={2} flexWrap="wrap">
            <SzerepkorValtas
              role={user.szerepkor}
              onToggle={() => void onRoleChange(user)}
            />
            <Badge colorScheme="blue">Utazások: {user.utazasok_szama}</Badge>
          </HStack>
        </Box>
        <HStack spacing={3}>
          <Button
            size="sm"
            bg="red.500"
            color="white"
            _hover={{ bg: 'red.600' }}
            onClick={deleteModal.onOpen}
          >
            Törlés
          </Button>
        </HStack>
      </Flex>

      <FelhasznaloTorlesModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={handleConfirmDelete}
        name={user.nev}
        email={user.email}
      />
    </Box>
  );
};

export default AdminFelhasznaloKartya;
