import React from 'react';
import { FormControl, FormLabel, HStack, Input, VStack } from '@chakra-ui/react';
import ChakraDatePicker from '../../../komponensek/ui/ChakraDatePicker';
import { glassInputStyle, labelStyle } from '../jegyForm.styles';

type UjJegySzallasMezokProps = {
  hely: string;
  cim: string;
  kezdoDatum: Date | null;
  vegDatum: Date | null;
  onHely: (value: string) => void;
  onCim: (value: string) => void;
  onKezdoDatum: (value: Date | null) => void;
  onVegDatum: (value: Date | null) => void;
};

const UjJegySzallasMezok: React.FC<UjJegySzallasMezokProps> = ({
  hely,
  cim,
  kezdoDatum,
  vegDatum,
  onHely,
  onCim,
  onKezdoDatum,
  onVegDatum,
}) => {
  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel {...labelStyle}>Hely</FormLabel>
        <Input
          value={hely}
          onChange={(e) => onHely(e.target.value)}
          placeholder="Pl. Hotel neve"
          {...glassInputStyle}
          px={4}
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyle}>Cím</FormLabel>
        <Input
          value={cim}
          onChange={(e) => onCim(e.target.value)}
          placeholder="Pl. Utca, házszám"
          {...glassInputStyle}
          px={4}
        />
      </FormControl>

      <HStack spacing={3} w="100%">
        <FormControl>
          <FormLabel {...labelStyle}>Kezdő dátum</FormLabel>
          <ChakraDatePicker
            selectedDate={kezdoDatum}
            onChange={onKezdoDatum}
            showTime={false}
            placeholder="ÉÉÉÉ. HH. NN."
          />
        </FormControl>

        <FormControl>
          <FormLabel {...labelStyle}>Vég dátum</FormLabel>
          <ChakraDatePicker
            selectedDate={vegDatum}
            onChange={onVegDatum}
            showTime={false}
            placeholder="ÉÉÉÉ. HH. NN."
            minDate={kezdoDatum || undefined}
          />
        </FormControl>
      </HStack>
    </VStack>
  );
};

export default UjJegySzallasMezok;
