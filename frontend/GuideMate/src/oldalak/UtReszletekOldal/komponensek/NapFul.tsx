import React from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon } from '@chakra-ui/icons';

type NapFulProps = {
  days: number[];
  activeDay: number;
  onSelectDay: (day: number) => void;
  onExport: () => void;
  onDeleteDays: () => void;
  daysScrollRef?: React.RefObject<HTMLDivElement>;
};

const NapFul: React.FC<NapFulProps> = ({
  days,
  activeDay,
  onSelectDay,
  onExport,
  onDeleteDays,
  daysScrollRef,
}) => {
  return (
    <HStack align="center" spacing={3} w="100%">
      <Box
        ref={daysScrollRef}
        bg="rgba(255,255,255,0.15)"
        borderRadius="lg"
        p={1}
        backdropFilter="blur(5px)"
        overflowX="auto"
        overflowY="hidden"
        w={{ base: '100%', md: '560px' }}
        maxW="100%"
        whiteSpace="nowrap"
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.75) rgba(255,255,255,0.15)',
          scrollbarGutter: 'stable',
          '&::-webkit-scrollbar': { height: '6px' },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3))',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.4))',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.18)',
            borderRadius: '999px',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)',
          },
        }}
      >
        <HStack spacing={0} flexWrap="nowrap" minW="max-content">
          {days.map((day) => (
            <Button
              key={day}
              data-day={day}
              onClick={() => onSelectDay(day)}
              bg={activeDay === day ? '#3B49DF' : 'transparent'}
              color="white"
              borderRadius="md"
              size="sm"
              px={6}
              minW="72px"
              flexShrink={0}
              _hover={{ bg: activeDay === day ? '#2b36a8' : 'rgba(255,255,255,0.1)' }}
              fontWeight="500"
            >
              {day}. nap
            </Button>
          ))}
        </HStack>
      </Box>

      <HStack spacing={2} data-export-hide>
        <IconButton
          aria-label="Export"
          icon={<DownloadIcon boxSize={3} />}
          size="sm"
          variant="solid"
          bg="rgba(255,255,255,0.2)"
          border="1px solid rgba(255,255,255,0.35)"
          color="white"
          flexShrink={0}
          onClick={onExport}
          _hover={{ bg: 'rgba(255,255,255,0.3)' }}
        />
        <IconButton
          aria-label="Törlés"
          icon={<DeleteIcon boxSize={3} />}
          size="sm"
          variant="solid"
          bg="rgba(255,255,255,0.2)"
          border="1px solid rgba(255,255,255,0.35)"
          color="white"
          flexShrink={0}
          onClick={onDeleteDays}
          _hover={{ bg: 'rgba(255,255,255,0.3)' }}
        />
      </HStack>
    </HStack>
  );
};

export default NapFul;
