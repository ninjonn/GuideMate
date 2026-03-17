import React from 'react';
import { FormControl, FormLabel, HStack, Input, VStack } from '@chakra-ui/react';
import type { FoglalasTipus } from '../../../features/foglalas/foglalas.api';
import ChakraDatePicker from '../../../komponensek/ui/ChakraDatePicker';
import { glassInputStyle, labelStyle } from '../jegyForm.styles';

type UjJegyUtazasMezokProps = {
  tipus: FoglalasTipus;
  indulasiHely: string;
  erkezesiHely: string;
  indulasiIdo: Date | null;
  erkezesiIdo: Date | null;
  jaratszam: string;
  onIndulasiHely: (value: string) => void;
  onErkezesiHely: (value: string) => void;
  onIndulasiIdo: (value: Date | null) => void;
  onErkezesiIdo: (value: Date | null) => void;
  onJaratszam: (value: string) => void;
};

const UjJegyUtazasMezok: React.FC<UjJegyUtazasMezokProps> = ({
  tipus,
  indulasiHely,
  erkezesiHely,
  indulasiIdo,
  erkezesiIdo,
  jaratszam,
  onIndulasiHely,
  onErkezesiHely,
  onIndulasiIdo,
  onErkezesiIdo,
  onJaratszam,
}) => {
  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel {...labelStyle}>Kiindulási hely</FormLabel>
        <Input
          value={indulasiHely}
          onChange={(e) => onIndulasiHely(e.target.value)}
          placeholder="Pl. Budapest"
          {...glassInputStyle}
          px={4}
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyle}>Érkezési hely</FormLabel>
        <Input
          value={erkezesiHely}
          onChange={(e) => onErkezesiHely(e.target.value)}
          placeholder="Pl. Párizs"
          {...glassInputStyle}
          px={4}
        />
      </FormControl>

      <HStack spacing={3} w="100%">
        <FormControl>
          <FormLabel {...labelStyle}>Indulás ideje</FormLabel>
          <ChakraDatePicker
            selectedDate={indulasiIdo}
            onChange={onIndulasiIdo}
            showTime={true}
            placeholder="Válassz időpontot"
          />
        </FormControl>

        <FormControl>
          <FormLabel {...labelStyle}>Érkezés ideje</FormLabel>
          <ChakraDatePicker
            selectedDate={erkezesiIdo}
            onChange={onErkezesiIdo}
            showTime={true}
            placeholder="Válassz időpontot"
            minDate={indulasiIdo || undefined}
          />
        </FormControl>
      </HStack>

      {tipus !== 'auto' && (
        <FormControl>
          <FormLabel {...labelStyle}>Járatszám (opcionális)</FormLabel>
          <Input
            value={jaratszam}
            onChange={(e) => onJaratszam(e.target.value)}
            placeholder="A járatod száma..."
            {...glassInputStyle}
            px={4}
          />
        </FormControl>
      )}
    </VStack>
  );
};

export default UjJegyUtazasMezok;
