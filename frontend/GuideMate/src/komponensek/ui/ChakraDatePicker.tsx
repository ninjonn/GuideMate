import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { hu } from "date-fns/locale";

const glassInputStyle = {
  bg: "rgba(255, 255, 255, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "white",
  _placeholder: { color: "rgba(255, 255, 255, 0.7)" },
  _focus: {
    bg: "rgba(255, 255, 255, 0.25)",
    borderColor: "#7BCBFF",
    boxShadow: "0 0 0 1px #7BCBFF",
  },
  _hover: {
    bg: "rgba(255, 255, 255, 0.2)",
  },
  borderRadius: "lg",
  height: "48px",
  fontSize: "15px",
  width: "100%",
  cursor: "pointer",
};

export interface ChakraDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  showTime?: boolean;
  placeholder?: string;
  minDate?: Date;
}

const ChakraDatePicker: React.FC<ChakraDatePickerProps> = ({
  selectedDate,
  onChange,
  showTime = false,
  placeholder,
  minDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
      setHour(selectedDate.getHours());
      setMinute(selectedDate.getMinutes());
    } else {
      setHour(12);
      setMinute(0);
    }
  }, [selectedDate, isOpen]);

  const onDateClick = (day: Date) => {
    let newDate = day;
    if (showTime) {
      newDate = setHours(newDate, hour);
      newDate = setMinutes(newDate, minute);
    }

    onChange(newDate);
    if (!showTime) setIsOpen(false);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextHour = Number(e.target.value);
    if (Number.isNaN(nextHour)) return;
    setHour(nextHour);
    if (selectedDate) {
      let newDate = setHours(selectedDate, nextHour);
      newDate = setMinutes(newDate, minute);
      onChange(newDate);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMinute = Number(e.target.value);
    if (Number.isNaN(nextMinute)) return;
    setMinute(nextMinute);
    if (selectedDate) {
      let newDate = setHours(selectedDate, hour);
      newDate = setMinutes(newDate, nextMinute);
      onChange(newDate);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const isDisabled = minDate ? day < addDays(minDate, -1) : false;
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <Button
            key={day.toString()}
            onClick={() => !isDisabled && onDateClick(cloneDay)}
            isDisabled={isDisabled}
            size="sm"
            variant="ghost"
            w="32px"
            h="32px"
            borderRadius="full"
            bg={isSelected ? "#3B49DF" : "transparent"}
            color={isSelected ? "white" : isCurrentMonth ? "white" : "whiteAlpha.400"}
            _hover={{ bg: isSelected ? "#3B49DF" : "whiteAlpha.200" }}
            fontWeight={isSelected ? "bold" : "normal"}
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
      <VStack spacing={1} mt={2}>
        {rows}
      </VStack>
    );
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-start"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Box position="relative">
          <Input
            value={
              selectedDate
                ? format(selectedDate, showTime ? "yyyy. MM. dd. HH:mm" : "yyyy. MM. dd.")
                : ""
            }
            placeholder={placeholder}
            readOnly
            onClick={() => setIsOpen(!isOpen)}
            {...glassInputStyle}
          />
          <CalendarIcon
            position="absolute"
            right="15px"
            top="15px"
            color="whiteAlpha.700"
            pointerEvents="none"
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent
        bg="#1a2642"
        borderColor="whiteAlpha.300"
        boxShadow="xl"
        w="auto"
        p={4}
        borderRadius="xl"
        _focus={{ outline: "none" }}
      >
        <PopoverBody p={0}>
          <Flex justify="space-between" align="center" mb={2}>
            <IconButton
              aria-label="Előző"
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={prevMonth}
            />
            <Text color="white" fontWeight="bold" fontSize="md">
              {format(currentMonth, "yyyy. MMMM", { locale: hu })}
            </Text>
            <IconButton
              aria-label="Következő"
              icon={<ChevronRightIcon />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={nextMonth}
            />
          </Flex>

          <SimpleGrid columns={7} spacing={1} mb={1}>
            {["H", "K", "Sz", "Cs", "P", "Sz", "V"].map((d) => (
              <Center key={d} w="32px">
                <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold">
                  {d}
                </Text>
              </Center>
            ))}
          </SimpleGrid>

          {renderCells()}

          {showTime && (
            <Box mt={4} pt={3} borderTop="1px solid rgba(255,255,255,0.1)">
              <HStack justify="center">
                <Text color="whiteAlpha.800" fontSize="sm" fontWeight="bold">
                  Idő:
                </Text>
                <Select
                  value={hour}
                  onChange={handleHourChange}
                  size="sm"
                  w="72px"
                  bg="whiteAlpha.100"
                  border="1px solid rgba(255,255,255,0.2)"
                  color="white"
                  _focus={{ borderColor: "#7BCBFF" }}
                  iconColor="white"
                  textAlign="center"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const label = String(i).padStart(2, "0");
                    return (
                      <option
                        key={label}
                        value={i}
                        style={{ background: "#232B5C", color: "white" }}
                      >
                        {label}
                      </option>
                    );
                  })}
                </Select>
                <Text color="whiteAlpha.800" fontWeight="bold">
                  :
                </Text>
                <Select
                  value={minute}
                  onChange={handleMinuteChange}
                  size="sm"
                  w="72px"
                  bg="whiteAlpha.100"
                  border="1px solid rgba(255,255,255,0.2)"
                  color="white"
                  _focus={{ borderColor: "#7BCBFF" }}
                  iconColor="white"
                  textAlign="center"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const label = String(i).padStart(2, "0");
                    return (
                      <option
                        key={label}
                        value={i}
                        style={{ background: "#232B5C", color: "white" }}
                      >
                        {label}
                      </option>
                    );
                  })}
                </Select>
              </HStack>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ChakraDatePicker;
