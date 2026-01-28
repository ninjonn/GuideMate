import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Link,
  VStack,
  FormControl,
  Center,
  ChakraProvider,
  extendTheme,
  useToast,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";

import { login } from "../../features/auth/auth.api";
import { setAuthToken } from "../../lib/api";

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  return (
    <ChakraProvider theme={theme}>
      <Box
        minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      position="relative"
      overflow="hidden"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 8, md: 12 }}
    >
      <Center minH="100vh" px={4} w="100%">
        <Box
          w={{ base: "100%", md: "788px" }}
          h={{ base: "auto", md: "611px" }}
          px={{ base: 6, md: 24 }}
          py={{ base: 10, md: 0 }}
          mt={{ base: 6, md: 10 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(12px)"
            borderRadius="15px"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant="flushed"
                      borderBottom="1px solid rgba(255,255,255,0.5)"
                      _placeholder={{ color: "#ffffffa0" }}
                      _focus={{ borderColor: "white", boxShadow: "none" }}
                      color="white"
                      fontSize="lg"
                      height="50px"
                      pl={10}
                      autoComplete="email"
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
                      value={jelszo}
                      onChange={(e) => setJelszo(e.target.value)}
                      variant="flushed"
                      borderBottom="1px solid rgba(255,255,255,0.5)"
                      _placeholder={{ color: "#ffffffa0" }}
                      _focus={{ borderColor: "white", boxShadow: "none" }}
                      color="white"
                      fontSize="lg"
                      height="50px"
                      pl={10}
                      autoComplete="current-password"
                    />
                  </InputGroup>
                </FormControl>

              </VStack>

              <Button
                w="100%"
                h="55px"
                mt={6}
                fontSize="xl"
                fontWeight="600"
                bg="#232B5C"
                isLoading={loading}
                _hover={{
                  filter: "brightness(1.2)",
                  transform: "scale(1.02)",
                }}
                transition="all 0.3s ease"
                color="white"
                borderRadius="lg"
                boxShadow="0 4px 15px rgba(0,0,0,0.2)"
                onClick={async () => {
                  try {
                    setLoading(true);

                    const res = await login({ email, jelszo });

                    // JWT elmentése és memória token frissítése
                    localStorage.setItem("gm_token", res.token);
                    setAuthToken(res.token);
                    localStorage.setItem("gm_user", JSON.stringify(res.felhasznalo));

                    toast({
                      title: "Sikeres bejelentkezés",
                      status: "success",
                      duration: 2000,
                      isClosable: true,
                    });

                    navigate("/profil");
                  } catch (err: unknown) {
                    const message =
                      err instanceof Error ? err.message : "Ismeretlen hiba";

                    toast({
                      title: "Bejelentkezés sikertelen",
                      description: message,
                      status: "error",
                      duration: 4000,
                      isClosable: true,
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
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
