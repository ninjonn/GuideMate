import React from 'react';
import { Box, Button, HStack, Input, Select } from '@chakra-ui/react';
import { glassCardStyle } from '../admin.styles';

type AdminSzurokProps = {
  search: string;
  role: '' | 'admin' | 'user';
  onSearchChange: (value: string) => void;
  onRoleChange: (value: '' | 'admin' | 'user') => void;
  onSearch: () => void;
  onReset: () => void;
  loading: boolean;
};

const AdminSzurok: React.FC<AdminSzurokProps> = ({
  search,
  role,
  onSearchChange,
  onRoleChange,
  onSearch,
  onReset,
  loading,
}) => {
  return (
    <Box {...glassCardStyle} p={4} mb={6}>
      <HStack spacing={3} flexWrap="wrap">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Keresés név / email"
          bg="white"
          color="gray.800"
          maxW={{ base: '100%', md: '300px' }}
        />
        <Select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as '' | 'admin' | 'user')}
          bg="white"
          color="gray.800"
          maxW={{ base: '100%', md: '200px' }}
          placeholder="Szerepkör"
        >
          <option value="admin">admin</option>
          <option value="user">user</option>
        </Select>
        <Button bg="#232B5C" color="white" _hover={{ bg: '#1a214d' }} onClick={onSearch} isLoading={loading}>
          Keresés
        </Button>
        <Button
          variant="outline"
          borderColor="whiteAlpha.400"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={onReset}
        >
          Reset
        </Button>
      </HStack>
    </Box>
  );
};

export default AdminSzurok;
