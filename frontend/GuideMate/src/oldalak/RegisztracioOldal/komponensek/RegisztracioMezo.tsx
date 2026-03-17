import React from 'react';
import { FormControl, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';

type RegisztracioMezoProps = {
  icon: React.ReactElement;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const RegisztracioMezo: React.FC<RegisztracioMezoProps> = ({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
}) => {
  return (
    <FormControl>
      <InputGroup>
        <InputLeftElement pointerEvents="none" pt={2}>
          {icon}
        </InputLeftElement>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          variant="flushed"
          borderBottom="1px solid rgba(255,255,255,0.5)"
          _placeholder={{ color: '#ffffffa0' }}
          _focus={{ borderColor: 'white', boxShadow: 'none' }}
          color="white"
          fontSize="lg"
          height="50px"
          pl={10}
        />
      </InputGroup>
    </FormControl>
  );
};

export default RegisztracioMezo;
