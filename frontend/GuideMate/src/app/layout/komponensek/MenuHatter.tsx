import React from 'react';
import { Box } from '@chakra-ui/react';

type MenuHatterProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MenuHatter: React.FC<MenuHatterProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.4)"
      backdropFilter="blur(8px)"
      zIndex="999"
      onClick={onClose}
    />
  );
};

export default MenuHatter;
