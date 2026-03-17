import React from 'react';
import { HStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

type MenuItem = {
  label: string;
  to: string;
};

type LinkStyles = {
  bg: string;
  hoverBg: string;
  backdropFilter: string;
};

type NavigaciosLinkekProps = {
  menuItems: MenuItem[];
  activePath: string;
  getLinkStyles: (isActive: boolean) => LinkStyles;
};

const NavigaciosLinkek: React.FC<NavigaciosLinkekProps> = ({
  menuItems,
  activePath,
  getLinkStyles,
}) => {
  return (
    <HStack spacing={6} display={{ base: 'none', md: 'flex' }} flex="1" justify="center">
      {menuItems.map((item) => {
        const isActive = activePath === item.to;
        const styles = getLinkStyles(isActive);

        return (
          <ChakraLink
            key={item.to}
            as={RouterLink}
            to={item.to}
            fontSize="18px"
            fontWeight="400"
            px={5}
            py={2.5}
            borderRadius="12px"
            transition="all 0.3s ease"
            bg={styles.bg}
            backdropFilter={styles.backdropFilter}
            _hover={{
              textDecoration: 'none',
              bg: styles.hoverBg,
            }}
          >
            {item.label}
          </ChakraLink>
        );
      })}
    </HStack>
  );
};

export default NavigaciosLinkek;
