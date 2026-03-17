import React from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaPen, FaTrash } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import type { Foglalas } from "../../../features/foglalas/foglalas.api";
import { TIPUS_LABEL } from "../jegyKovetes.constants";
import { formatDateTime } from "../jegyKovetes.utils";

type JegyKartyaProps = {
  foglalas: Foglalas;
  onDelete: (id: number) => void;
};

const JegyKartya: React.FC<JegyKartyaProps> = ({ foglalas, onDelete }) => {
  return (
    <Box
      bg="rgba(255, 255, 255, 0.15)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      border="1px solid rgba(255, 255, 255, 0.2)"
      p={6}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      transition="transform 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 12px rgba(0,0,0,0.15)" }}
    >
      <Flex justify="space-between" align="start" mb={4}>
        <Heading size="lg" fontWeight="700" textTransform="capitalize">
          {TIPUS_LABEL[foglalas.tipus]}
        </Heading>

        <HStack spacing={2}>
          <IconButton
            aria-label="Edit"
            icon={<Icon as={FaPen} />}
            variant="outline"
            colorScheme="whiteAlpha"
            size="sm"
            borderRadius="md"
            border="1px solid rgba(255,255,255,0.3)"
            _hover={{ bg: "whiteAlpha.200" }}
            as={RouterLink}
            to={`/jegy-szerkesztes/${foglalas.azonosito}`}
            state={{ foglalas }}
          />
          <IconButton
            aria-label="Delete"
            icon={<Icon as={FaTrash} />}
            variant="outline"
            colorScheme="whiteAlpha"
            size="sm"
            borderRadius="md"
            border="1px solid rgba(255,255,255,0.3)"
            _hover={{ bg: "red.500", borderColor: "red.500" }}
            onClick={() => onDelete(foglalas.azonosito)}
          />
        </HStack>
      </Flex>

      <VStack align="start" spacing={3} fontSize="md" fontWeight="500">
        {foglalas.tipus === "szallas" ? (
          <>
            <Text>{foglalas.hely}</Text>
            <Text color="whiteAlpha.900">Cím: {foglalas.cim}</Text>
            <Text color="whiteAlpha.900">Kezdete: {foglalas.kezdo_datum}</Text>
            <Text color="whiteAlpha.900">Vége: {foglalas.veg_datum}</Text>
          </>
        ) : (
          <>
            <Text>
              {foglalas.indulasi_hely}{" "}
              <span style={{ opacity: 0.7, margin: "0 5px" }}>→</span>{" "}
              {foglalas.erkezesi_hely}
            </Text>
            <Text color="whiteAlpha.900">Indulás: {formatDateTime(foglalas.indulasi_ido)}</Text>
            <Text color="whiteAlpha.900">Érkezés: {formatDateTime(foglalas.erkezesi_ido)}</Text>
            <Text color="whiteAlpha.900">Járatszám: {foglalas.jaratszam ?? "-"}</Text>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default JegyKartya;
