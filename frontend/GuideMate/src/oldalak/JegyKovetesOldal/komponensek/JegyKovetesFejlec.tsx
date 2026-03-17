import React from "react";
import { Heading, Text, VStack } from "@chakra-ui/react";

const JegyKovetesFejlec: React.FC = () => {
  return (
    <VStack spacing={2} textAlign="center">
      <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} fontWeight="700">
        Jegykövetés
      </Heading>
      <Text fontSize={{ base: "md", md: "lg" }} maxW="600px" color="whiteAlpha.900">
        Add hozzá manuálisan utazási jegyeid és kövesd, hol tartanak az utazásaid.
      </Text>
    </VStack>
  );
};

export default JegyKovetesFejlec;
