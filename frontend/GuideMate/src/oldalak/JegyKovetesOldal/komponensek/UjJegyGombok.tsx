import React from 'react';
import { Button, HStack } from '@chakra-ui/react';

type UjJegyGombokProps = {
  isEdit: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSave: () => void;
};

const UjJegyGombok: React.FC<UjJegyGombokProps> = ({ isEdit, isLoading, onCancel, onSave }) => {
  return (
    <HStack spacing={3} pt={4} justify="space-between">
      <Button
        bg="white"
        color="#232B5C"
        height="48px"
        width="48%"
        fontWeight="600"
        borderRadius="lg"
        _hover={{ bg: 'gray.200' }}
        onClick={onCancel}
      >
        Mégse
      </Button>

      <Button
        bg="#232B5C"
        color="white"
        height="48px"
        width="48%"
        fontWeight="600"
        borderRadius="lg"
        _hover={{ filter: 'brightness(1.2)' }}
        isLoading={isLoading}
        onClick={onSave}
        boxShadow="0 4px 12px rgba(0,0,0,0.2)"
      >
        {isEdit ? 'Mentés' : 'Hozzáadás'}
      </Button>
    </HStack>
  );
};

export default UjJegyGombok;
