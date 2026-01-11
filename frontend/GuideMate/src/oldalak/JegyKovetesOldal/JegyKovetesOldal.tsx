import { Link as RouterLink } from "react-router-dom";
import React from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  IconButton,
  Icon,
  ChakraProvider,
  extendTheme,
  Container,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa"; // npm install react-icons szükséges lehet

// --- Téma beállítások (Inter font) ---
const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      "@import":
        "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap')",
      body: { margin: 0, padding: 0, boxSizing: "border-box" },
    },
  },
});

// --- Mock Adatok a kártyákhoz ---
const ticketsData = [
  {
    id: 1,
    type: "Repülőút",
    from: "Budapest",
    to: "Párizs",
    departure: "2025.04.22. 09:30",
    arrival: "2025.04.22. 11:20",
    flightNum: "AF1234",
  },
  {
    id: 2,
    type: "Busz út",
    from: "Budapest",
    to: "Párizs",
    departure: "2025.04.22. 09:30",
    arrival: "2025.04.22. 11:20",
    flightNum: "AF1234",
  },
  {
    id: 3,
    type: "Repülőút",
    from: "Budapest",
    to: "Párizs",
    departure: "2025.04.22. 09:30",
    arrival: "2025.04.22. 11:20",
    flightNum: "AF1234",
  },
  {
    id: 4,
    type: "Repülőút",
    from: "Budapest",
    to: "Párizs",
    departure: "2025.04.22. 09:30",
    arrival: "2025.04.22. 11:20",
    flightNum: "AF1234",
  },
];

const JegyKovetesOldal: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Box
        minH="100vh"
        w="100vw"
        // Háttér gradiens (fixálva a korábbi kérések alapján)
        bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
        position="relative"
        overflowX="hidden"
        color="white"
      >
        {/* --- PAGE CONTENT --- */}
        <Container maxW="1000px" pt={{ base: 24, md: 32 }} pb={10} px={4}>
          <VStack spacing={8} w="100%">
            {/* Fejléc Szövegek */}
            <VStack spacing={2} textAlign="center">
              <Heading
                as="h1"
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="700"
              >
                Jegykövetés
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                maxW="600px"
                color="whiteAlpha.900"
              >
                Add hozzá manuálisan utazási jegyeid és kövesd, hol tartanak az
                utazásaid.
              </Text>
            </VStack>

            {/* Keresés és Hozzáadás Sáv */}
            <Flex
              w="100%"
              direction={{ base: "column", md: "row" }}
              gap={4}
              justify="center"
              align="center"
              mt={4}
            >
              {/* Keresőmező */}
              <InputGroup maxW={{ base: "100%", md: "400px" }}>
                <Input
                  bg="white"
                  color="gray.800"
                  placeholder="Keresés járatszám vagy hely alapján"
                  _placeholder={{ color: "gray.500" }}
                  borderRadius="full"
                  height="50px"
                  pl={6}
                  boxShadow="md"
                />
                <InputLeftElement
                  height="50px"
                  right="10px"
                  left="auto"
                  pointerEvents="none"
                >
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
              </InputGroup>

              {/* Új jegy gomb */}
              <Button
                as={RouterLink}
                to="/jegykovetes/uj-jegy"
                leftIcon={<FaPlus size={12} />}
                bg="#232B5C"
                color="white"
                h="50px"
                px={8}
                borderRadius="lg"
                fontWeight="600"
                _hover={{ bg: "#1a214d", transform: "scale(1.02)" }}
                transition="all 0.2s"
                boxShadow="lg"
                w={{ base: "100%", md: "auto" }}
              >
                Új jegy hozzáadása
              </Button>
            </Flex>

            {/* Grid Layout a kártyáknak */}
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={6}
              w="100%"
              mt={8}
            >
              {ticketsData.map((ticket) => (
                <Box
                  key={ticket.id}
                  // Glassmorphism kártya stílus
                  bg="rgba(255, 255, 255, 0.15)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  p={6}
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                  transition="transform 0.2s"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Kártya Fejléc: Cím + Gombok */}
                  <Flex justify="space-between" align="start" mb={4}>
                    <Heading size="lg" fontWeight="700">
                      {ticket.type}
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
                      />
                    </HStack>
                  </Flex>

                  {/* Kártya Adatok */}
                  <VStack
                    align="start"
                    spacing={3}
                    fontSize="md"
                    fontWeight="500"
                  >
                    <Text>
                      {ticket.from}{" "}
                      <span style={{ opacity: 0.7, margin: "0 5px" }}>→</span>{" "}
                      {ticket.to}
                    </Text>
                    <Text color="whiteAlpha.900">
                      Indulás: {ticket.departure}
                    </Text>
                    <Text color="whiteAlpha.900">
                      Érkezés: {ticket.arrival}
                    </Text>
                    <Text color="whiteAlpha.900">
                      Járatszám: {ticket.flightNum}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default JegyKovetesOldal;
