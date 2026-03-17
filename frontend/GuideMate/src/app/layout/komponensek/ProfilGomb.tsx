import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ProfilIkon from './ProfilIkon';

type ProfilGombProps = {
  isAuthed: boolean;
};

const ProfilGomb: React.FC<ProfilGombProps> = ({ isAuthed }) => {
  return (
    <Flex
      flex="1"
      display={{ base: 'none', md: 'flex' }}
      align="center"
      justify="flex-end"
    >
      <Flex
        as={RouterLink}
        to={isAuthed ? '/profil' : '/bejelentkezes'}
        align="center"
        justify="center"
        w="48px"
        h="48px"
        borderRadius="14px"
        border="1px solid rgba(255, 255, 255, 0.4)"
        cursor="pointer"
        transition="0.2s"
        _hover={{ bg: 'whiteAlpha.200', borderColor: 'white' }}
      >
        <ProfilIkon boxSize={6} />
      </Flex>
    </Flex>
  );
};

export default ProfilGomb;
