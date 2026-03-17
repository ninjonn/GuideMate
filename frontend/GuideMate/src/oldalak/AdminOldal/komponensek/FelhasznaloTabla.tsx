import React from 'react';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import type { AdminUserListItem } from '../../../features/admin/admin.api';
import AdminFelhasznaloKartya from './AdminFelhasznaloKartya';

type FelhasznaloTablaProps = {
  users: AdminUserListItem[];
  loading: boolean;
  onRoleChange: (user: AdminUserListItem) => void;
  onDelete: (user: AdminUserListItem) => void;
};

const FelhasznaloTabla: React.FC<FelhasznaloTablaProps> = ({
  users,
  loading,
  onRoleChange,
  onDelete,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {loading && (
        <Flex align="center" gap={3}>
          <Spinner color="white" />
          <Text>Felhasználók betöltése...</Text>
        </Flex>
      )}

      {!loading && users.length === 0 && <Text>Nincs találat.</Text>}

      {users.map((user) => (
        <AdminFelhasznaloKartya
          key={user.azonosito}
          user={user}
          onRoleChange={onRoleChange}
          onDelete={onDelete}
        />
      ))}
    </VStack>
  );
};

export default FelhasznaloTabla;
