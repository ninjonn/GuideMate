import React from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import type { ChecklistItem } from '../utReszletek.types';

type EllenorzoListaPanelProps = {
  items: ChecklistItem[];
  isMobileView?: boolean;
  onToggle: (id: number) => void;
  onAdd: () => void;
  onDeleteChecked: () => void;
};

const EllenorzoListaPanel: React.FC<EllenorzoListaPanelProps> = ({
  items,
  isMobileView = false,
  onToggle,
  onAdd,
  onDeleteChecked,
}) => {
  return (
    <VStack align="stretch" spacing={3} w="100%">
      <HStack mb={4} justify="center" spacing={3}>
        <Button size="xs" bg="white" color="black" borderRadius="full" px={4} onClick={onAdd}>
          Hozzáadás
        </Button>
        <Button size="xs" bg="white" color="black" borderRadius="full" px={4} onClick={onDeleteChecked}>
          Törlés
        </Button>
      </HStack>
      {items.length === 0 && (
        <Text textAlign="center" opacity={0.6} fontSize="sm">
          Nincs elem.
        </Text>
      )}
      {items.map((item) => (
        <HStack key={item.id} spacing={3} onClick={() => onToggle(item.id)} cursor="pointer">
          <Box
            w="24px"
            h="24px"
            borderRadius="6px"
            bg="#1E2A4F"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            border={
              item.checked
                ? 'none'
                : `1px solid ${isMobileView ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}`
            }
          >
            {item.checked && <Icon as={CheckIcon} color="white" w={3} h={3} />}
          </Box>
          <Text
            fontSize="lg"
            color="#1E2A4F"
            fontWeight="500"
            textDecoration={item.checked ? 'line-through' : 'none'}
            opacity={item.checked ? 0.6 : 1}
          >
            {item.text}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};

export default EllenorzoListaPanel;
