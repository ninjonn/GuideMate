import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Heading,
  HStack,
  Text,
  VStack,
  type BoxProps,
} from '@chakra-ui/react';
import type { ChecklistItem } from '../utazastervezo.types';

type EllenorzoListaPanelProps = {
  checklist: ChecklistItem[];
  onToggleItem: (id: number) => void;
  onAddItem: () => void;
  onDeleteChecked: () => void;
  onSave: () => void;
  glassStyle: BoxProps;
};

const EllenorzoListaPanel: React.FC<EllenorzoListaPanelProps> = ({
  checklist,
  onToggleItem,
  onAddItem,
  onDeleteChecked,
  onSave,
  glassStyle,
}) => {
  return (
    <Box {...glassStyle} p={6} height="fit-content">
      <Heading size="md" mb={6} textAlign="center">
        Utazó ellenőrzőlista
      </Heading>

      <VStack spacing={4} align="stretch">
        <HStack>
          <Button
            size="sm"
            bg="white"
            color="#232B5C"
            flex={1}
            borderRadius="full"
            _hover={{ bg: 'gray.200' }}
            onClick={onAddItem}
          >
            Hozzáadás
          </Button>
          <Button
            size="sm"
            bg="rgba(255,255,255,0.3)"
            color="white"
            flex={1}
            borderRadius="full"
            _hover={{ bg: 'rgba(255,255,255,0.4)' }}
            onClick={onDeleteChecked}
          >
            Törlés
          </Button>
        </HStack>

        <Divider borderColor="whiteAlpha.400" />

        <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" pr={1}>
          {checklist.length === 0 && (
            <Text fontSize="sm" opacity={0.7} textAlign="center">
              A lista üres.
            </Text>
          )}

          {checklist.map((item) => (
            <Checkbox
              key={item.id}
              isChecked={item.isChecked}
              onChange={() => onToggleItem(item.id)}
              colorScheme="whiteAlpha"
              size="lg"
              spacing="1rem"
              sx={{
                '.chakra-checkbox__control': {
                  borderColor: 'whiteAlpha.800',
                  _checked: {
                    bg: '#232B5C',
                    borderColor: '#232B5C',
                    color: 'white',
                  },
                },
                '.chakra-checkbox__label': {
                  fontSize: 'md',
                  fontWeight: '500',
                },
              }}
            >
              {item.text}
            </Checkbox>
          ))}
        </VStack>

        <Button
          mt={4}
          bg="#3B49DF"
          color="white"
          size="lg"
          width="100%"
          borderRadius="xl"
          _hover={{ filter: 'brightness(1.2)' }}
          boxShadow="0 4px 15px rgba(0,0,0,0.2)"
          onClick={onSave}
        >
          Mentés
        </Button>
      </VStack>
    </Box>
  );
};

export default EllenorzoListaPanel;
