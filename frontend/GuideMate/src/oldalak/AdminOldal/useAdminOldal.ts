import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  deleteAdminUser,
  getAdminStats,
  listAdminUsers,
  updateAdminUserRole,
  type AdminStatsResponse,
  type AdminUserListItem,
} from '../../features/admin/admin.api';

export const useAdminOldal = () => {
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

  const handleReset = () => {
    setSearch('');
    setRole('');
    void loadUsers(1);
  };

  return {
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
  };
};
