import React from 'react';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

type DatumValasztoFejlecProps = {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
};

const DatumValasztoFejlec: React.FC<DatumValasztoFejlecProps> = ({
  currentMonth,
  onPrev,
  onNext,
}) => {
  return (
    <Flex justify="space-between" align="center" mb={2}>
      <IconButton
        aria-label="Előző"
        icon={<ChevronLeftIcon />}
        size="sm"
        variant="ghost"
        color="white"
        onClick={onPrev}
      />
      <Text color="white" fontWeight="bold" fontSize="md">
        {format(currentMonth, 'yyyy. MMMM', { locale: hu })}
      </Text>
      <IconButton
        aria-label="Következő"
        icon={<ChevronRightIcon />}
        size="sm"
        variant="ghost"
        color="white"
        onClick={onNext}
      />
    </Flex>
  );
};

export default DatumValasztoFejlec;
