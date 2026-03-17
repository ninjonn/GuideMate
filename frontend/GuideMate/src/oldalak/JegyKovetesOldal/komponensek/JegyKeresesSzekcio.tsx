import React from "react";
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaPlus } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

type JegyKeresesSzekcioProps = {
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
};

const JegyKeresesSzekcio: React.FC<JegyKeresesSzekcioProps> = ({
  query,
  onQueryChange,
  loading,
}) => {
  return (
    <Flex
      w="100%"
      direction={{ base: "column", md: "row" }}
      gap={4}
      justify="center"
      align="center"
      mt={4}
    >
      <InputGroup maxW={{ base: "100%", md: "400px" }}>
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          bg="white"
          color="gray.800"
          placeholder="Keresés típus / hely / járatszám alapján"
          _placeholder={{ color: "gray.500" }}
          borderRadius="full"
          height="50px"
          pl={6}
          boxShadow="md"
        />
        <InputLeftElement height="50px" right="10px" left="auto" pointerEvents="none">
          <SearchIcon color="gray.500" />
        </InputLeftElement>
      </InputGroup>

      <Button
        as={RouterLink}
        to="/uj-jegy"
        leftIcon={<FaPlus size={12} />}
        bg="#232B5C"
        color="white"
        height="50px"
        px={8}
        borderRadius="lg"
        fontWeight="600"
        _hover={{ bg: "#1a214d", transform: "scale(1.02)" }}
        transition="all 0.2s"
        boxShadow="lg"
        w={{ base: "100%", md: "auto" }}
        isLoading={loading}
      >
        Új jegy hozzáadása
      </Button>
    </Flex>
  );
};

export default JegyKeresesSzekcio;
