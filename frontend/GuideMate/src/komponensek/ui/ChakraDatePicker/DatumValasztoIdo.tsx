import React from 'react';
import { Box, HStack, Select, Text } from '@chakra-ui/react';

type DatumValasztoIdoProps = {
  hour: number;
  minute: number;
  onHourChange: (value: number) => void;
  onMinuteChange: (value: number) => void;
};

const DatumValasztoIdo: React.FC<DatumValasztoIdoProps> = ({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}) => {
  return (
    <Box mt={4} pt={3} borderTop="1px solid rgba(255,255,255,0.1)">
      <HStack justify="center">
        <Text color="whiteAlpha.800" fontSize="sm" fontWeight="bold">
          Idő:
        </Text>
        <Select
          value={hour}
          onChange={(e) => onHourChange(Number(e.target.value))}
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
              <option key={label} value={i} style={{ background: "#232B5C", color: "white" }}>
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
          onChange={(e) => onMinuteChange(Number(e.target.value))}
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
              <option key={label} value={i} style={{ background: "#232B5C", color: "white" }}>
                {label}
              </option>
            );
          })}
        </Select>
      </HStack>
    </Box>
  );
};

export default DatumValasztoIdo;
