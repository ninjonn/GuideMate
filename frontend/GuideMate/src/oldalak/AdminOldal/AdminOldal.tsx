import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import {
  deleteAdminUser,
  getAdminStats,
  listAdminUsers,
  updateAdminUserRole,
  type AdminStatsResponse,
  type AdminUserListItem,
} from '../../features/admin/admin.api';

const AdminOldal: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'' | 'admin' | 'user'>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getAdminStats();
      setStats(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ismeretlen hiba';
      toast({
        title: 'Nem sikerült betölteni a statisztikát',
        description: msg,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async (nextPage = page) => {
    try {
      setLoadingUsers(true);
      const res = await listAdminUsers({
        oldal: nextPage,
        limit: 20,
        kereses: search.trim() || undefined,
        szerepkor: role || undefined,
      });
      setUsers(res.felhasznalok);
      setPage(res.oldal);
      setTotalPages(res.oldalak_szama);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ismeretlen hiba';
      toast({
        title: 'Nem sikerült betölteni a felhasználókat',
        description: msg,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadStats();
    void loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearch = () => {
    void loadUsers(1);
  };

  const handleRoleChange = async (user: AdminUserListItem) => {
    const nextRole = user.szerepkor === 'admin' ? 'user' : 'admin';
    try {
      const res = await updateAdminUserRole(user.azonosito, nextRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.azonosito === user.azonosito ? { ...u, szerepkor: res.szerepkor } : u,
        ),
      );
      toast({
        title: 'Szerepkör frissítve',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ismeretlen hiba';
      toast({
        title: 'Nem sikerült frissíteni a szerepkört',
        description: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (user: AdminUserListItem) => {
    if (!window.confirm('Biztosan törlöd ezt a felhasználót?')) return;
    try {
      await deleteAdminUser(user.azonosito);
      setUsers((prev) => prev.filter((u) => u.azonosito !== user.azonosito));
      toast({
        title: 'Felhasználó törölve',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ismeretlen hiba';
      toast({
        title: 'Nem sikerült törölni a felhasználót',
        description: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
              <StatCard
                title="Felhasználók"
                value={stats.felhasznalok.osszesen}
                subtitle={`Admin: ${stats.felhasznalok.adminok}, User: ${stats.felhasznalok.regular_users}`}
              />
              <StatCard
                title="Utazások"
                value={stats.utazasok.osszesen}
              />
              <StatCard title="Programok" value={stats.programok.osszesen} />
              <StatCard title="Foglalások" value={stats.foglalasok.osszesen} />
            </SimpleGrid>
          )}
        </Box>

        <Box {...glassCardStyle} p={4} mb={6}>
          <HStack spacing={3} flexWrap="wrap">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keresés név / email"
              bg="white"
              color="gray.800"
              maxW={{ base: "100%", md: "300px" }}
            />
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as '' | 'admin' | 'user')}
              bg="white"
              color="gray.800"
              maxW={{ base: "100%", md: "200px" }}
              placeholder="Szerepkör"
            >
              <option value="admin">admin</option>
              <option value="user">user</option>
            </Select>
            <Button
              bg="#232B5C"
              color="white"
              _hover={{ bg: "#1a214d" }}
              onClick={handleSearch}
              isLoading={loadingUsers}
            >
              Keresés
            </Button>
            <Button
              variant="outline"
              borderColor="whiteAlpha.400"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => {
                setSearch('');
                setRole('');
                void loadUsers(1);
              }}
            >
              Reset
            </Button>
          </HStack>
        </Box>

        <VStack spacing={4} align="stretch">
          {loadingUsers && (
            <Flex align="center" gap={3}>
              <Spinner color="white" />
              <Text>Felhasználók betöltése...</Text>
            </Flex>
          )}

          {!loadingUsers && users.length === 0 && (
            <Text>Nincs találat.</Text>
          )}

          {users.map((user) => (
            <Box key={user.azonosito} {...glassCardStyle} p={5}>
              <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
                <Box>
                  <Heading size="md">{user.nev}</Heading>
                  <Text opacity={0.8}>{user.email}</Text>
                  <HStack spacing={2} mt={2}>
                    <Badge colorScheme={user.szerepkor === 'admin' ? 'purple' : 'green'}>
                      {user.szerepkor}
                    </Badge>
                    <Badge colorScheme="blue">Utazások: {user.utazasok_szama}</Badge>
                  </HStack>
                </Box>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    bg="white"
                    color="#232B5C"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => void handleRoleChange(user)}
                  >
                    Szerepkör váltás
                  </Button>
                  <Button
                    size="sm"
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={() => void handleDeleteUser(user)}
                  >
                    Törlés
                  </Button>
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>

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

const glassCardStyle = {
  bg: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  borderRadius: "20px",
};

const StatCard: React.FC<{ title: string; value: number; subtitle?: string }> = ({
  title,
  value,
  subtitle,
}) => (
  <Box {...glassCardStyle} p={5}>
    <Text fontSize="sm" opacity={0.8}>{title}</Text>
    <Heading size="lg" mt={1}>{value}</Heading>
    {subtitle && (
      <Text fontSize="sm" opacity={0.8} mt={2}>{subtitle}</Text>
    )}
  </Box>
);

export default AdminOldal;
