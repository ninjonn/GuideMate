import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { glassCardStyle } from '../admin.styles';

type AdminStatKartyaProps = {
  title: string;
  value: number;
  subtitle?: string;
};

const AdminStatKartya: React.FC<AdminStatKartyaProps> = ({ title, value, subtitle }) => (
  <Box {...glassCardStyle} p={5}>
    <Text fontSize="sm" opacity={0.8}>
      {title}
    </Text>
    <Heading size="lg" mt={1}>
      {value}
    </Heading>
    {subtitle && (
      <Text fontSize="sm" opacity={0.8} mt={2}>
        {subtitle}
      </Text>
    )}
  </Box>
);

export default AdminStatKartya;
