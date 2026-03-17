import React from 'react';
import { Box, Collapse, HStack, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ProfilIkon from './ProfilIkon';

type MenuItem = {
  label: string;
  to: string;
};

type MobilMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  activePath: string;
  isAuthed: boolean;
};

const MobilMenu: React.FC<MobilMenuProps> = ({
  isOpen,
  onClose,
  menuItems,
  activePath,
  isAuthed,
}) => {
  return (
    <Collapse in={isOpen} animateOpacity>
      <Box
        mt={4}
        p={4}
        display={{ md: 'none' }}
        bg="rgba(20, 30, 60, 0.85)"
        backdropFilter="blur(20px)"
        borderRadius="16px"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.4)"
        position="relative"
        zIndex="1001"
      >
        <VStack spacing={2} align="stretch">
          {menuItems.map((item) => {
            const isActive = activePath === item.to;

            return (
              <ChakraLink
                key={item.to}
                as={RouterLink}
                to={item.to}
                onClick={onClose}
                w="100%"
                textAlign="center"
                fontSize="18px"
                fontWeight="500"
                py={3}
                borderRadius="12px"
                transition="all 0.3s ease"
                bg={isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent'}
                _hover={{
                  textDecoration: 'none',
                  bg: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {item.label}
              </ChakraLink>
            );
          })}

          <ChakraLink
            as={RouterLink}
            to={isAuthed ? '/profil' : '/bejelentkezes'}
            onClick={onClose}
            w="100%"
            textAlign="center"
            fontSize="18px"
            fontWeight="500"
            py={3}
            borderRadius="12px"
            transition="all 0.3s ease"
            _hover={{ bg: 'rgba(255, 255, 255, 0.15)' }}
            border="1px solid rgba(255, 255, 255, 0.25)"
            mt={3}
          >
            <HStack justify="center" spacing={3}>
              <ProfilIkon boxSize={5} />
              <Text>{isAuthed ? 'Profil' : 'Bejelentkezés'}</Text>
            </HStack>
          </ChakraLink>
        </VStack>
      </Box>
    </Collapse>
  );
};

export default MobilMenu;
