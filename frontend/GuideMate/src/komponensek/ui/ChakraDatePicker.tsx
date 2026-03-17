import React, { useEffect, useState } from "react";
import {
  Box,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { addMonths, format, setHours, setMinutes, subMonths } from "date-fns";
import DatumValasztoFejlec from "./ChakraDatePicker/DatumValasztoFejlec";
import DatumValasztoNapok from "./ChakraDatePicker/DatumValasztoNapok";
import DatumValasztoIdo from "./ChakraDatePicker/DatumValasztoIdo";
import { glassInputStyle } from "./ChakraDatePicker/ChakraDatePicker.styles";

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

  const handleHourChange = (nextHour: number) => {
    if (Number.isNaN(nextHour)) return;
    setHour(nextHour);
    if (selectedDate) {
      let newDate = setHours(selectedDate, nextHour);
      newDate = setMinutes(newDate, minute);
      onChange(newDate);
    }
  };

  const handleMinuteChange = (nextMinute: number) => {
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
          <DatumValasztoFejlec currentMonth={currentMonth} onPrev={prevMonth} onNext={nextMonth} />

          <DatumValasztoNapok
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            minDate={minDate}
            onSelect={onDateClick}
          />

          {showTime && (
            <DatumValasztoIdo
              hour={hour}
              minute={minute}
              onHourChange={handleHourChange}
              onMinuteChange={handleMinuteChange}
            />
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ChakraDatePicker;
