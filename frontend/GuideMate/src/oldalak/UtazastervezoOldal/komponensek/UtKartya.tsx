import React from 'react';
import { Box, Button, Heading, HStack, Text, VStack, type BoxProps } from '@chakra-ui/react';
import type { Trip } from '../utazastervezo.types';

type UtKartyaProps = {
  trip: Trip;
  onOpen: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  glassStyle: BoxProps;
};

const UtKartya: React.FC<UtKartyaProps> = ({ trip, onOpen, onEdit, onDelete, glassStyle }) => {
  return (
    <Box
      {...glassStyle}
      p={6}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      <Heading size="lg" mb={2}>
        {trip.title}
      </Heading>
      {trip.description && (
        <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
          {trip.description}
        </Text>
      )}

      <VStack align="start" spacing={1} mb={6} color="whiteAlpha.900">
        <Text fontSize="sm">
          {trip.startDate} → {trip.endDate}
        </Text>
        <Text fontSize="md">{trip.days} nap</Text>
        <Text fontSize="md">{trip.programs} program</Text>
        <Text fontSize="sm" opacity={0.8}>
          Ellenőrzőlista: {trip.checklistDone}/{trip.checklistTotal} kész
        </Text>
      </VStack>

      <HStack spacing={4}>
        <Button
          bg="#232B5C"
          color="white"
          flex={1}
          borderRadius="lg"
          _hover={{ filter: 'brightness(1.2)' }}
          onClick={() => onOpen(trip.id)}
        >
          Megnyitás
        </Button>
        <Button
          bg="white"
          color="#232B5C"
          flex={1}
          borderRadius="lg"
          _hover={{ bg: 'gray.100' }}
          onClick={() => onEdit(trip.id)}
        >
          Szerkesztés
        </Button>
      </HStack>
      <Button
        mt={3}
        bg="rgba(255,255,255,0.3)"
        color="white"
        width="100%"
        borderRadius="lg"
        _hover={{ bg: 'rgba(255,255,255,0.45)' }}
        onClick={() => void onDelete(trip.id)}
      >
        Törlés
      </Button>
    </Box>
  );
};

export default UtKartya;
