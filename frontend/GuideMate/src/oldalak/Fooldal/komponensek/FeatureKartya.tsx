import React from 'react';
import { Box, Divider, Flex, Icon, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export type FeatureKartyaProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
};

const FeatureKartya: React.FC<FeatureKartyaProps> = ({ title, description, icon, to }) => {
  return (
    <Box
      as={RouterLink}
      to={to}
      position="relative"
      bg={{ base: 'rgba(255,255,255,0.10)', md: 'rgba(30, 60, 100, 0.40)' }}
      backdropFilter={{ base: 'blur(6px)', md: 'blur(10px)' }}
      borderRadius={{ base: '14px', md: '16px' }}
      border={{ base: '1px solid rgba(255,255,255,0.14)', md: '1px solid rgba(255,255,255,0.22)' }}
      p={{ base: 3, md: 6 }}
      color="white"
      transition="0.2s"
      boxShadow={{ base: 'none', md: 'lg' }}
      _hover={{
        transform: { base: 'none', md: 'translateY(-5px)' },
        bg: { base: 'rgba(255,255,255,0.14)', md: 'rgba(30,60,100,0.60)' },
        borderColor: { base: 'rgba(255,255,255,0.18)', md: 'rgba(255,255,255,0.40)' },
      }}
      _active={{ transform: { base: 'scale(0.99)', md: 'translateY(-3px)' } }}
    >
      <Stack
        direction={{ base: 'row', md: 'column' }}
        spacing={{ base: 3, md: 3 }}
        align={{ base: 'center', md: 'center' }}
        textAlign={{ base: 'left', md: 'center' }}
      >
        <Flex
          w={{ base: '40px', md: '42px' }}
          h={{ base: '40px', md: '42px' }}
          borderRadius="12px"
          bg={{ base: 'rgba(255,255,255,0.12)', md: 'whiteAlpha.200' }}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} w={{ base: 4, md: 5 }} h={{ base: 4, md: 5 }} />
        </Flex>

        <Box w="100%">
          <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="700" lineHeight="1.2">
            {title}
          </Text>

          <Divider display={{ base: 'none', md: 'block' }} borderColor="whiteAlpha.400" my={3} />

          <Text
            fontSize={{ base: 'sm', md: 'sm' }}
            opacity={{ base: 0.82, md: 0.92 }}
            noOfLines={{ base: 1, md: 2 }}
            mt={{ base: 0.5, md: 0 }}
          >
            {description}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default FeatureKartya;
