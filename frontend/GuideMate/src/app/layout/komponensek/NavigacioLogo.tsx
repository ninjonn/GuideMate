import React from "react";
import { Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NavigacioLogo: React.FC = () => {
  return (
    <Flex flex={{ base: "0", md: "1" }} align="center">
      <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
        <Text
          fontSize="32px"
          fontWeight="700"
          lineHeight="110%"
          letterSpacing="-0.02em"
          textShadow="0 4px 4px rgba(0,0,0,0.25)"
        >
          GuideMate
        </Text>
      </ChakraLink>
    </Flex>
  );
};

export default NavigacioLogo;
