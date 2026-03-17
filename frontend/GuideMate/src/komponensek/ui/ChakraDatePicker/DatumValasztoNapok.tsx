import React from 'react';
import { Button, Center, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

type DatumValasztoNapokProps = {
  currentMonth: Date;
  selectedDate: Date | null;
  minDate?: Date;
  onSelect: (day: Date) => void;
};

const hetNapjai = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];

const DatumValasztoNapok: React.FC<DatumValasztoNapokProps> = ({
  currentMonth,
  selectedDate,
  minDate,
  onSelect,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: React.ReactElement[] = [];
  let days: React.ReactElement[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i += 1) {
      const formattedDate = format(day, 'd');
      const cloneDay = day;
      const isDisabled = minDate ? day < addDays(minDate, -1) : false;
      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
      const isCurrentMonth = isSameMonth(day, monthStart);

      days.push(
        <Button
          key={day.toString()}
          onClick={() => !isDisabled && onSelect(cloneDay)}
          isDisabled={isDisabled}
          size="sm"
          variant="ghost"
          w="32px"
          h="32px"
          borderRadius="full"
          bg={isSelected ? '#3B49DF' : 'transparent'}
          color={isSelected ? 'white' : isCurrentMonth ? 'white' : 'whiteAlpha.400'}
          _hover={{ bg: isSelected ? '#3B49DF' : 'whiteAlpha.200' }}
          fontWeight={isSelected ? 'bold' : 'normal'}
          fontSize="sm"
        >
          {formattedDate}
        </Button>,
      );
      day = addDays(day, 1);
    }
    rows.push(
      <HStack key={day.toString()} justify="space-between">
        {days}
      </HStack>,
    );
    days = [];
  }

  return (
    <>
      <SimpleGrid columns={7} spacing={1} mb={1}>
        {hetNapjai.map((label, index) => (
          <Center key={`${label}-${index}`} w="32px">
            <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold">
              {label}
            </Text>
          </Center>
        ))}
      </SimpleGrid>

      <VStack spacing={1} mt={2}>
        {rows}
      </VStack>
    </>
  );
};

export default DatumValasztoNapok;
