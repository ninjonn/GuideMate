import React from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import type { FoglalasTipus } from '../../../features/foglalas/foglalas.api';
import { glassInputStyle, labelStyle } from '../jegyForm.styles';

type UjJegyTipusValasztoProps = {
  value: FoglalasTipus;
  onChange: (value: FoglalasTipus) => void;
};

const UjJegyTipusValaszto: React.FC<UjJegyTipusValasztoProps> = ({ value, onChange }) => {
  return (
    <FormControl>
      <FormLabel {...labelStyle}>Utazás típusa</FormLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as FoglalasTipus)}
        sx={{
          ...glassInputStyle,
          '> option': { background: '#232B5C', color: 'white' },
        }}
        iconColor="white"
      >
        <option value="repulo">Repülő</option>
        <option value="busz">Busz</option>
        <option value="vonat">Vonat</option>
        <option value="auto">Autó</option>
        <option value="szallas">Szállás</option>
      </Select>
    </FormControl>
  );
};

export default UjJegyTipusValaszto;
