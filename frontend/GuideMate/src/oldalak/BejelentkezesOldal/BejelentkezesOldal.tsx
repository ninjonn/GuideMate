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
  Checkbox,
  Link,
  VStack,
  FormControl,
  Center,
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      "@import":
        "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap')",
      body: {
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      },
    },
  },
});

const LoginPage: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Box
        minH="100vh"
        w="100vw"
        // Előző lépésben fixált gradiens
        bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
        position="relative"
        overflow="hidden"
        color="white"
      >
        <Center minH="100vh" px={4}>
          {/* --- Login Card --- */}
          <Box
            // Figma méretek: W 788px, H 611px
            w={{ base: "100%", md: "788px" }}
            h={{ base: "auto", md: "611px" }}
            // Padding a tartalomnak, mobilon igazodva
            px={{ base: 6, md: 24 }}
            py={{ base: 10, md: 0 }}
            // Flexbox a tartalom vertikális középre igazításához a fix magasságban
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            // Figma Fill: #FFFFFF 10%
            bg="rgba(255, 255, 255, 0.1)"
            // Glassmorphism effektek
            backdropFilter="blur(12px)"
            // Figma Corner radius: 15px
            borderRadius="15px"
            // Vékony keret és árnyék (Drop shadow)
            border="1px solid rgba(255, 255, 255, 0.2)"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
          >
            <VStack spacing={8} w="100%">
              <Heading as="h1" size="xl" fontWeight="700" mb={4}>
                Bejelentkezés
              </Heading>

              <VStack spacing={6} w="100%">
                <FormControl>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" pt={2}>
                      <EmailIcon color="white" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="Email"
                      variant="flushed"
                      borderBottom="1px solid rgba(255,255,255,0.5)"
                      _placeholder={{ color: "#ffffffa0" }}
                      _focus={{ borderColor: "white", boxShadow: "none" }}
                      color="white"
                      fontSize="lg"
                      height="50px"
                      pl={10}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" pt={2}>
                      <LockIcon color="white" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      type="password"
                      placeholder="Jelszó"
                      variant="flushed"
                      borderBottom="1px solid rgba(255,255,255,0.5)"
                      _placeholder={{ color: "#ffffffa0" }}
                      _focus={{ borderColor: "white", boxShadow: "none" }}
                      color="white"
                      fontSize="lg"
                      height="50px"
                      pl={10}
                    />
                  </InputGroup>
                </FormControl>

                <Flex
                  w="100%"
                  justify="space-between"
                  fontSize="sm"
                  pt={2}
                  align="center"
                >
                  <Checkbox
                    colorScheme="blackAlpha"
                    sx={{
                      "[data-checked] .chakra-checkbox__control": {
                        bg: "rgba(30, 40, 70, 0.8)",
                        borderColor: "transparent",
                      },
                      ".chakra-checkbox__control": {
                        borderColor: "whiteAlpha.600",
                        bg: "transparent",
                      },
                    }}
                  >
                    <Text ml={1} color="whiteAlpha.900">
                      Emlékezz rám
                    </Text>
                  </Checkbox>

                  <Link
                    _hover={{ textDecoration: "underline", color: "white" }}
                    color="whiteAlpha.900"
                  >
                    Elfelejtett jelszó?
                  </Link>
                </Flex>
              </VStack>

              <Button
                w="100%"
                h="55px"
                mt={6}
                fontSize="xl"
                fontWeight="600"
                bg="#232B5C"
                _hover={{
                  filter: "brightness(1.2)",
                  transform: "scale(1.02)",
                }}
                transition="all 0.3s ease"
                color="white"
                borderRadius="lg"
                boxShadow="0 4px 15px rgba(0,0,0,0.2)"
              >
                Bejelentkezés
              </Button>

              <Text fontSize="sm" color="whiteAlpha.800" mt={2}>
                Még nincs fiókod?{" "}
                <Link
                  as={RouterLink}
                  to="/regisztracio"
                  fontWeight="600"
                  textDecoration="underline"
                  _hover={{ color: "white" }}
                >
                  Regisztráció
                </Link>
              </Text>
            </VStack>
          </Box>
        </Center>
      </Box>
    </ChakraProvider>
  );
};

export default LoginPage;
