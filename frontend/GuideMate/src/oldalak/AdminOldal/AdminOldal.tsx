import React from 'react';
import { Box, Center } from '@chakra-ui/react';

const AdminOldal: React.FC = () => {
  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      position="relative"
      overflow="hidden"
      color="white"
      pt={{ base: 24, md: 32 }}
    >
      <Center minH="100vh" px={4}>
        {/* IDE JÖN MAJD AZ OLDAL TARTALMA */}
      </Center>
    </Box>
  );
};

export default AdminOldal;