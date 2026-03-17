import {
  Box,
  Text,
  Heading,
  Button,
  Link,
  VStack,
  Center,
  useToast,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../features/auth/auth.api";
import RegisztracioMezo from "./komponensek/RegisztracioMezo";
import SzemelyIkon from "./komponensek/SzemelyIkon";

const RegisztracioOldal: React.FC = () => {
  const [vezeteknev, setVezeteknev] = useState("");
  const [keresztnev, setKeresztnev] = useState("");
  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [jelszo2, setJelszo2] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async () => {
    const trimmedV = vezeteknev.trim();
    const trimmedK = keresztnev.trim();
    const trimmedE = email.trim();

    if (!trimmedV || !trimmedK || !trimmedE || !jelszo || !jelszo2) {
      toast({
        title: "Hiányzó adatok",
        description: "Kérlek tölts ki minden mezőt.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (jelszo.length < 6) {
      toast({
        title: "Rövid jelszó",
        description: "A jelszónak legalább 6 karakter hosszúnak kell lennie.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (jelszo !== jelszo2) {
      toast({
        title: "Jelszavak nem egyeznek",
        description: "A megadott jelszavaknak egyezniük kell.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await register({
        vezeteknev: trimmedV,
        keresztnev: trimmedK,
        email: trimmedE,
        jelszo,
      });

      toast({
        title: "Sikeres regisztráció",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      navigate("/bejelentkezes");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Regisztráció sikertelen",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
      py={{ base: 8, md: 12 }} // legyen szellősebb, de a navbar ne takarja
    >
      <Center minH="100vh" px={4} w="100%">

        {/* --- REGISZTRÁCIÓS KÁRTYA --- */}
        <Box
          w={{ base: "100%", md: "788px" }}
          px={{ base: 6, md: 20 }}
          py={10}
          mt={{ base: 4, md: 6 }}
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

              <RegisztracioMezo
                icon={<SzemelyIkon color="white" boxSize={5} />}
                placeholder="Vezetéknév"
                value={vezeteknev}
                onChange={setVezeteknev}
              />

              <RegisztracioMezo
                icon={<SzemelyIkon color="white" boxSize={5} />}
                placeholder="Keresztnév"
                value={keresztnev}
                onChange={setKeresztnev}
              />

              <RegisztracioMezo
                icon={<EmailIcon color="white" boxSize={5} />}
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
              />

              <RegisztracioMezo
                icon={<LockIcon color="white" boxSize={5} />}
                type="password"
                placeholder="Jelszó"
                value={jelszo}
                onChange={setJelszo}
              />

              <RegisztracioMezo
                icon={<LockIcon color="white" boxSize={5} />}
                type="password"
                placeholder="Jelszó megerősítése"
                value={jelszo2}
                onChange={setJelszo2}
              />

            </VStack>

            {/* Regisztráció gomb */}
            <Button
              w="100%"
              h="55px"
              mt={2}
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
              onClick={onSubmit}
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
