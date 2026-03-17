import React from 'react';
import { Box, Flex, Heading, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import type { EventItem } from '../utReszletek.types';

const whiteCardStyle = {
  bg: '#F7FAFC',
  borderRadius: 'xl',
  boxShadow: 'sm',
  color: '#2D3748',
  p: 4,
  width: '100%',
};

type IdovonalProps = {
  events: EventItem[];
  onEdit: (event: EventItem) => void;
  onDelete: (id: number) => void;
};

const Idovonal: React.FC<IdovonalProps> = ({ events, onEdit, onDelete }) => {
  return (
    <Box position="relative" w="100%">
      <Box
        position="relative"
        maxH={{ base: '520px', md: '640px', lg: '680px' }}
        overflowY="auto"
        pr={2}
        pb={2}
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.7) rgba(255,255,255,0.12)',
          scrollbarGutter: 'stable',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.28))',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.4))',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.16)',
            borderRadius: '999px',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)',
          },
        }}
        data-export-scroll
      >
        <Box position="relative" minH="100%">
          <Box
            display={{ base: 'none', md: 'block' }}
            position="absolute"
            left="75px"
            top="0"
            bottom="0"
            w="3px"
            bg="rgba(255,255,255,0.3)"
            zIndex={0}
          />

          <VStack spacing={{ base: 3, md: 6 }} align="stretch" position="relative" zIndex={1} pb={2}>
            {events.length === 0 && (
              <Text ml={{ base: 4, md: 24 }} pt={4} fontSize="sm" opacity={0.8}>
                Nincs program.
              </Text>
            )}

            {events.map((event) => (
              <Flex
                key={event.id}
                align={{ base: 'stretch', md: 'flex-start' }}
                direction={{ base: 'column', md: 'row' }}
                position="relative"
                mb={{ base: 2, md: 0 }}
              >
                <Text
                  w={{ base: 'auto', md: '60px' }}
                  fontSize={{ base: 'sm', md: 'xs' }}
                  fontWeight="600"
                  mt={{ base: 0, md: 4 }}
                  mb={{ base: 1, md: 0 }}
                  opacity={0.8}
                  textAlign={{ base: 'left', md: 'right' }}
                  mr={{ base: 0, md: 8 }}
                >
                  {event.timeStart}
                </Text>

                <Box
                  display={{ base: 'none', md: 'block' }}
                  position="absolute"
                  left="71px"
                  top="22px"
                  w="10px"
                  h="10px"
                  bg="rgba(255,255,255,0.5)"
                  borderRadius="full"
                />

                <Box {...whiteCardStyle} minH="80px">
                  <Heading size="md" mb={1} color="#1E2A4F">
                    {event.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {event.timeStart} - {event.timeEnd}
                  </Text>
                  {event.description && (
                    <Text fontSize="sm" color="gray.600" mt={2} whiteSpace="pre-wrap">
                      {event.description}
                    </Text>
                  )}
                  <HStack mt={3} spacing={2} justify={{ base: 'flex-end', md: 'flex-start' }}>
                    <IconButton aria-label="Edit" icon={<EditIcon />} size="xs" onClick={() => onEdit(event)} />
                    <IconButton
                      aria-label="Delete"
                      icon={<DeleteIcon />}
                      size="xs"
                      colorScheme="red"
                      onClick={() => onDelete(event.id)}
                    />
                  </HStack>
                  <Box h="1px" bg="gray.300" mt={6} w="100%" display={{ base: 'none', md: 'block' }} />
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Idovonal;
