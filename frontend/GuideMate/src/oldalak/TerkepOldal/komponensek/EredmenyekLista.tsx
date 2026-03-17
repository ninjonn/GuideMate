import React from 'react';
import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import type { Place } from '../../../lib/opentripmap';

type EredmenyekListaProps = {
  places: Place[];
  loading: boolean;
  mode: 'area' | 'specific';
  hasMore: boolean;
  loadingMore: boolean;
  onSelectPlace: (place: Place) => void;
  onLoadMore: () => void;
};

const EredmenyekLista: React.FC<EredmenyekListaProps> = ({
  places,
  loading,
  mode,
  hasMore,
  loadingMore,
  onSelectPlace,
  onLoadMore,
}) => {
  return (
    <>
      {loading && (
        <Text fontSize="sm" color="gray.600" p={3}>
          Betöltés...
        </Text>
      )}
      {places.map((place) => (
        <HStack
          key={place.xid}
          p={3}
          borderRadius="lg"
          _hover={{ bg: 'rgba(255,255,255,0.5)' }}
          cursor="pointer"
          onClick={() => onSelectPlace(place)}
          transition="all 0.2s"
          align="start"
        >
          <Image
            src={place.image}
            fallbackSrc="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
            boxSize={{ base: '48px', md: '60px' }}
            objectFit="cover"
            borderRadius="md"
            alt={place.name}
            loading="lazy"
          />
          <VStack align="start" spacing={0} flex="1" minW={0}>
            <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
              {place.name}
            </Text>
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {place.kinds}
            </Text>
            {place.address && (
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {place.address}
              </Text>
            )}
            <HStack fontSize="xs" color="gray.500" mt={1}>
              <TimeIcon />
              <Text>Népszerű</Text>
            </HStack>
          </VStack>
        </HStack>
      ))}
      {mode === 'area' && hasMore && (
        <Button mt={2} size="sm" alignSelf="center" onClick={onLoadMore} isLoading={loadingMore}>
          További találatok
        </Button>
      )}
    </>
  );
};

export default EredmenyekLista;
