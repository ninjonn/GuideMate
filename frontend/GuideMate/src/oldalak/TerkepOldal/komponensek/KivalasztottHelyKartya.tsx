import React from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Image,
  Stack,
  Text,
  VStack,
  type BoxProps,
} from '@chakra-ui/react';
import type { Place } from '../../../lib/opentripmap';

type KivalasztottHelyKartyaProps = {
  place: Place;
  onClose: () => void;
  onAdd: () => void;
  panelStyle: BoxProps;
};

const KivalasztottHelyKartya: React.FC<KivalasztottHelyKartyaProps> = ({
  place,
  onClose,
  onAdd,
  panelStyle,
}) => {
  return (
    <Box
      w={{ base: '100%', lg: '450px' }}
      maxH={{ base: '80vh', lg: 'none' }}
      overflowY={{ base: 'auto', lg: 'visible' }}
      {...panelStyle}
      p={{ base: 5, md: 8 }}
      pointerEvents="auto"
      position={{ base: 'fixed', lg: 'relative' }}
      bottom={{ base: 0, lg: 'auto' }}
      left={{ base: 0, lg: 'auto' }}
      right={{ base: 0, lg: 'auto' }}
      borderRadius={{ base: '20px 20px 0 0', lg: '20px' }}
      m={{ base: 0, lg: 0 }}
      zIndex={{ base: 20, lg: 'auto' }}
      borderBottom={{ base: 'none', lg: '1px solid rgba(255,255,255,0.4)' }}
    >
      <IconButton
        aria-label="Close"
        icon={<Text>X</Text>}
        size="sm"
        position="absolute"
        top={4}
        right={4}
        onClick={onClose}
      />

      {place.image && (
        <Box mb={4} borderRadius="lg" overflow="hidden" maxH="150px">
          <Image
            src={place.image}
            fallbackSrc="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
            w="100%"
            h="100%"
            objectFit="cover"
            alt={place.name}
          />
        </Box>
      )}

      <VStack spacing={3} align="stretch">
        <Text
          fontSize="xs"
          fontWeight="700"
          color="#1E2A4F"
          letterSpacing="0.08em"
          textTransform="uppercase"
        >
          Kiválasztott hely
        </Text>

        <Box
          bg="whiteAlpha.700"
          borderRadius="lg"
          p={3}
          border="1px solid rgba(0,0,0,0.06)"
        >
          <Text fontSize="md" fontWeight="700" color="#1E2A4F" mb={1}>
            {place.name}
          </Text>
          <Text fontSize="xs" color="gray.500" fontWeight="600" mb={1}>
            Cím
          </Text>
          <Text fontSize="sm" color="gray.600">
            {place.address ?? place.kinds}
          </Text>
          {place.kinds && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              Kategória: {place.kinds}
            </Text>
          )}
        </Box>

        <Divider />

        <Text fontSize="sm" color="gray.600" textAlign="center">
          Válaszd ki, melyik utazás és nap programjához add hozzá.
        </Text>

        <Stack w="100%" pt={2} spacing={3} direction="row">
          <Button size="sm" flex={1} bg="white" color="#1E2A4F" onClick={onClose}>
            Mégse
          </Button>
          <Button
            size="sm"
            flex={1}
            bg="#1E2A4F"
            color="white"
            _hover={{ bg: '#151d36' }}
            onClick={onAdd}
          >
            Hozzáadás
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default KivalasztottHelyKartya;
