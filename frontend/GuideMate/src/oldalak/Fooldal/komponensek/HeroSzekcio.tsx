import React from 'react';
import { Box, Button, Flex, Stack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const HeroSzekcio: React.FC = () => {
  return (
    <Flex
      direction="column"
      align="stretch"
      pt={{ base: '56px', md: '140px', lg: '180px' }}
      mb={{ base: 6, md: '180px', lg: '220px' }}
    >
      <Box
        maxW={{ base: '100%', md: '680px' }}
        mx={{ base: 'auto', md: 0 }}
        textAlign={{ base: 'center', md: 'left' }}
        bg={{ base: 'rgba(0,0,0,0.28)', md: 'transparent' }}
        border={{ base: '1px solid', md: 'none' }}
        borderColor={{ base: 'whiteAlpha.200', md: 'transparent' }}
        borderRadius={{ base: '16px', md: '0px' }}
        p={{ base: 4, sm: 5, md: 0 }}
        backdropFilter={{ base: 'blur(8px)', md: 'none' }}
        boxShadow={{ base: 'none', md: 'none' }}
      >
        <VStack spacing={{ base: 3, md: 4 }} align={{ base: 'center', md: 'flex-start' }}>
          <Text
            fontSize={{ base: '34px', sm: '40px', md: '6xl', lg: '7xl' }}
            fontWeight="extrabold"
            letterSpacing="-0.02em"
            lineHeight={{ base: '1.06', md: '1.0' }}
            textShadow={{ base: 'none', md: '0 12px 30px rgba(0,0,0,0.30)' }}
          >
            GuideMate
          </Text>

          <Text
            fontSize={{ base: 'sm', sm: 'md', md: '2xl' }}
            opacity={0.9}
            lineHeight="1.5"
            maxW={{ base: '38ch', md: 'unset' }}
          >
            Egy hely, ahol minden utazásod életre kel.
          </Text>

          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={{ base: 3, md: 4 }}
            pt={{ base: 2, md: 2 }}
            w={{ base: '100%', md: 'auto' }}
          >
            <Button
              as={RouterLink}
              to="/utazastervezo"
              size="lg"
              h={{ base: '48px', md: '52px' }}
              bg="white"
              color="#1e293b"
              fontWeight="bold"
              fontSize={{ base: 'sm', md: 'md' }}
              px={{ base: 6, md: 8 }}
              borderRadius="12px"
              boxShadow={{ base: 'none', md: '0 12px 30px rgba(255, 255, 255, 0.28)' }}
              _active={{ transform: 'scale(0.99)' }}
              _hover={{ bg: 'gray.100' }}
              w={{ base: '100%', md: 'auto' }}
            >
              Utazástervezés megnyitása
            </Button>

            <Button
              as={RouterLink}
              to="/terkep"
              size="lg"
              h={{ base: '48px', md: '52px' }}
              bg="#273a68"
              color="white"
              fontWeight="bold"
              fontSize={{ base: 'sm', md: 'md' }}
              px={{ base: 6, md: 8 }}
              borderRadius="12px"
              _hover={{ bg: '#354a80' }}
              _active={{ transform: 'scale(0.99)' }}
              w={{ base: '100%', md: 'auto' }}
            >
              Térkép böngészése
            </Button>
          </Stack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default HeroSzekcio;
