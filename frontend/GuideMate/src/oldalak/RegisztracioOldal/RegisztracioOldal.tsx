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
  Icon,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

// Személy ikon (Figma alapján)
const PersonIcon = (props: any) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const RegisztracioOldal: React.FC = () => {
  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      position="relative"
      overflow="hidden"
      color="white"
      pt={{ base: 24, md: 32 }} // hogy a Navigációs sáv alatt legyen hely
    >
      <Center minH="100vh" px={4}>

        {/* --- REGISZTRÁCIÓS KÁRTYA --- */}
        <Box
          w={{ base: "100%", md: "788px" }}
          px={{ base: 6, md: 20 }}
          py={10}
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(12px)"
          borderRadius="15px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
        >
          <VStack spacing={8} w="100%">

            <Heading as="h1" size="xl" fontWeight="700" textAlign="center">
              Regisztráció
            </Heading>

            <VStack spacing={6} w="100%">

              {/* Vezetéknév */}
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" pt={2}>
                    <PersonIcon color="white" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Vezetéknév"
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

              {/* Keresztnév */}
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" pt={2}>
                    <PersonIcon color="white" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Keresztnév"
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

              {/* Email */}
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

              {/* Jelszó */}
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

              {/* Jelszó megerősítése */}
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" pt={2}>
                    <LockIcon color="white" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Jelszó megerősítése"
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

            </VStack>

            {/* Regisztráció gomb */}
            <Button
              w="100%"
              h="55px"
              mt={2}
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
              Regisztráció
            </Button>

            {/* Vissza a bejelentkezéshez */}
            <Text fontSize="sm" color="rgb(35, 43, 92)">
              Már van fiókod?{" "}
              <Link
                as={RouterLink}
                to="/bejelentkezes"
                fontWeight="600"
                textDecoration="underline"
                _hover={{ color: "white" }}
              >
                Bejelentkezés
              </Link>
            </Text>

          </VStack>
        </Box>

      </Center>
    </Box>
  );
};

export default RegisztracioOldal;