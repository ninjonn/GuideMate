import React from 'react';
import { Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import FeatureKartya, { type FeatureKartyaProps } from './FeatureKartya';

type FeatureSzekcioProps = {
  items: FeatureKartyaProps[];
};

const FeatureSzekcio: React.FC<FeatureSzekcioProps> = ({ items }) => {
  return (
    <Box
      bg={{ base: 'transparent', md: 'transparent' }}
      border={{ base: 'none', md: 'none' }}
      borderColor={{ base: 'transparent', md: 'transparent' }}
      borderRadius={{ base: '0px', md: '0px' }}
      p={{ base: 0, md: 0 }}
      backdropFilter={{ base: 'none', md: 'none' }}
      boxShadow={{ base: 'none', md: 'none' }}
    >
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize={{ base: 'md', md: '2xl' }} fontWeight="700">
            Fedezd fel a lehetőségeket
          </Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 3, md: 6 }}>
          {items.map((item) => (
            <FeatureKartya key={item.to} {...item} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default FeatureSzekcio;
