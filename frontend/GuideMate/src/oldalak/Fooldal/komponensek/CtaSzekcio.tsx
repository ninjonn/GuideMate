import React from 'react';
import { Box, Button, Stack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const CtaSzekcio: React.FC = () => {
  return (
    <Box
      mt={{ base: 8, md: 16 }}
      bg={{ base: 'rgba(255,255,255,0.10)', md: 'rgba(255,255,255,0.12)' }}
      border="1px solid rgba(255,255,255,0.2)"
      borderRadius={{ base: '16px', md: '20px' }}
      p={{ base: 4, md: 10 }}
      textAlign="center"
      backdropFilter={{ base: 'blur(8px)', md: 'blur(10px)' }}
      boxShadow={{ base: 'none', md: 'none' }}
    >
      <VStack spacing={{ base: 3, md: 4 }}>
        <Text fontSize={{ base: 'lg', md: '3xl' }} fontWeight="800">
          Lépj be a GuideMate utazók közé
        </Text>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 3, md: 4 }}
          align="center"
          justify="center"
          w="100%"
        >
          <Button
            as={RouterLink}
            to="/bejelentkezes"
            size="lg"
            h={{ base: '48px', md: '52px' }}
            bg="#F6D365"
            color="#333"
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 8, md: 12 }}
            borderRadius="12px"
            w={{ base: '100%', md: 'auto' }}
          >
            Belépés
          </Button>

          <Button
            as={RouterLink}
            to="/regisztracio"
            size="lg"
            h={{ base: '48px', md: '52px' }}
            bg="rgba(255,255,255,0.18)"
            color="white"
            fontWeight="600"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 8, md: 12 }}
            borderRadius="12px"
            border="1px solid rgba(255,255,255,0.5)"
            _hover={{ bg: 'rgba(255,255,255,0.28)' }}
            w={{ base: '100%', md: 'auto' }}
          >
            Regisztráció
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default CtaSzekcio;
