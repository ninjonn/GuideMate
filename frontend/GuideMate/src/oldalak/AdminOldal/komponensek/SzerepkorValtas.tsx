import React from 'react';
import { Badge, Button, HStack } from '@chakra-ui/react';

type SzerepkorValtasProps = {
  role: 'admin' | 'user';
  onToggle: () => void;
};

const SzerepkorValtas: React.FC<SzerepkorValtasProps> = ({ role, onToggle }) => {
  return (
    <HStack spacing={2}>
      <Badge colorScheme={role === 'admin' ? 'purple' : 'green'}>{role}</Badge>
      <Button
        size="sm"
        bg="white"
        color="#232B5C"
        _hover={{ bg: 'gray.100' }}
        onClick={onToggle}
      >
        Szerepkör váltás
      </Button>
    </HStack>
  );
};

export default SzerepkorValtas;
