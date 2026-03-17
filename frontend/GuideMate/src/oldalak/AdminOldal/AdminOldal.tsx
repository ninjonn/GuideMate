import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
} from '@chakra-ui/react';
import AdminStatKartya from './komponensek/AdminStatKartya';
import AdminSzurok from './komponensek/AdminSzurok';
import FelhasznaloTabla from './komponensek/FelhasznaloTabla';
import { useAdminOldal } from './useAdminOldal';

const AdminOldal: React.FC = () => {
  const {
    stats,
    users,
    loadingStats,
    loadingUsers,
    search,
    role,
    page,
    totalPages,
    setSearch,
    setRole,
    loadUsers,
    handleSearch,
    handleRoleChange,
    handleDeleteUser,
    handleReset,
  } = useAdminOldal();

  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      position="relative"
      overflow="hidden"
      color="white"
      pt={{ base: 24, md: 32 }}
      pb={10}
    >
      <Container maxW="1200px">
        <Heading size="2xl" mb={6}>Admin</Heading>

        <Box mb={8}>
          {loadingStats && (
            <Flex align="center" gap={3}>
              <Spinner color="white" />
              <Text>Statisztika betöltése...</Text>
            </Flex>
          )}

          {stats && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <AdminStatKartya
                title="Felhasználók"
                value={stats.felhasznalok.osszesen}
                subtitle={`Admin: ${stats.felhasznalok.adminok}, User: ${stats.felhasznalok.regular_users}`}
              />
              <AdminStatKartya
                title="Utazások"
                value={stats.utazasok.osszesen}
              />
              <AdminStatKartya title="Programok" value={stats.programok.osszesen} />
              <AdminStatKartya title="Foglalások" value={stats.foglalasok.osszesen} />
            </SimpleGrid>
          )}
        </Box>

        <AdminSzurok
          search={search}
          role={role}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loadingUsers}
        />

        <FelhasznaloTabla
          users={users}
          loading={loadingUsers}
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteUser}
        />

        {totalPages > 1 && (
          <HStack justify="center" mt={6} spacing={3}>
            <Button
              variant="ghost"
              color="white"
              onClick={() => void loadUsers(page - 1)}
              isDisabled={page <= 1}
            >
              Előző
            </Button>
            <Text>{page} / {totalPages}</Text>
            <Button
              variant="ghost"
              color="white"
              onClick={() => void loadUsers(page + 1)}
              isDisabled={page >= totalPages}
            >
              Következő
            </Button>
          </HStack>
        )}
      </Container>
    </Box>
  );
};

export default AdminOldal;
