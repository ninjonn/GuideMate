import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import type { ProfileResponse } from '../../../features/auth/auth.api';

type ProfilAdatokProps = {
  profile: ProfileResponse;
  onEditProfile: () => void;
  onEditPassword: () => void;
  onLogout: () => void;
};

const AvatarIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const ProfilAdatok: React.FC<ProfilAdatokProps> = ({
  profile,
  onEditProfile,
  onEditPassword,
  onLogout,
}) => {
  return (
    <Box
      w={{ base: '100%', md: '600px', lg: '700px' }}
      p={{ base: 6, md: 10 }}
      bg="rgba(255, 255, 255, 0.15)"
      backdropFilter="blur(12px)"
      borderRadius="15px"
      border="1px solid rgba(255, 255, 255, 0.2)"
      boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <VStack spacing={6} w="100%">
        <VStack spacing={3}>
          <Avatar
            size="2xl"
            name=""
            bg="#232B5C"
            color="white"
            border="2px solid rgba(255,255,255,0.6)"
            showBorder={true}
            icon={<AvatarIcon boxSize={10} />}
          />
          <Text fontSize="2xl" fontWeight="700">
            {profile.nev}
          </Text>
        </VStack>

        <Divider borderColor="rgba(255,255,255,0.3)" />

        <VStack spacing={4} w="100%" align="stretch">
          <DataRow label="Név" value={profile.nev} onEdit={onEditProfile} />
          <DataRow label="Email" value={profile.email} onEdit={onEditProfile} />
          <DataRow label="Jelszó" value="••••••••••••" onEdit={onEditPassword} />
        </VStack>

        <Box
          mt={4}
          px={4}
          py={2}
          bg="rgba(255, 255, 255, 0.2)"
          borderRadius="full"
          border="1px solid rgba(255, 255, 255, 0.3)"
        >
          <Text fontSize="sm" fontWeight="600">
            Utazások száma: {profile.utazasok_szama}
          </Text>
        </Box>

        <Button
          w="100%"
          h="50px"
          mt={4}
          fontSize="lg"
          fontWeight="600"
          bg="#232B5C"
          _hover={{
            filter: 'brightness(1.2)',
            transform: 'scale(1.02)',
          }}
          transition="all 0.3s ease"
          color="white"
          borderRadius="lg"
          boxShadow="0 4px 15px rgba(0,0,0,0.2)"
          onClick={onLogout}
        >
          Kijelentkezés
        </Button>
      </VStack>
    </Box>
  );
};

type DataRowProps = {
  label: string;
  value: string;
  onEdit: () => void;
};

const DataRow: React.FC<DataRowProps> = ({ label, value, onEdit }) => {
  return (
    <Flex
      align="center"
      justify="space-between"
      w="100%"
      borderBottom="1px solid rgba(255,255,255,0.3)"
      pb={2}
    >
      <HStack spacing={4} flex={1}>
        <Text w="80px" fontSize="sm" color="whiteAlpha.700" fontWeight="500">
          {label}
        </Text>
        <Text fontSize="md" fontWeight="500" isTruncated>
          {value}
        </Text>
      </HStack>

      <IconButton
        aria-label={`Edit ${label}`}
        icon={<EditIcon />}
        variant="ghost"
        color="whiteAlpha.800"
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
        size="sm"
        onClick={onEdit}
      />
    </Flex>
  );
};

export default ProfilAdatok;
