import React from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Button,
  VStack,
  Icon,
  Container,
  Divider,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaBus, FaMapMarkerAlt, FaFolderOpen } from "react-icons/fa";

// TÍPUS
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

// KÉPEK
const desktopHero = "/assets/hero-plane-desktop.png";
const mobileHero = "/assets/hero-plane-mobil.png";

// FŐ SZÍN
const mountainBottomColor = "#276fb3";

// Feature kártya (MOBILON: list row / kompakt, DESKTOPON: marad kártyás)
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, to }) => {
  return (
    <Box
      as={RouterLink}
      to={to}
      position="relative"
      bg={{ base: "rgba(255,255,255,0.10)", md: "rgba(30, 60, 100, 0.40)" }}
      backdropFilter={{ base: "blur(6px)", md: "blur(10px)" }}
      borderRadius={{ base: "14px", md: "16px" }}
      border={{ base: "1px solid rgba(255,255,255,0.14)", md: "1px solid rgba(255,255,255,0.22)" }}
      p={{ base: 3, md: 6 }}
      color="white"
      transition="0.2s"
      boxShadow={{ base: "none", md: "lg" }}
      _hover={{
        transform: { base: "none", md: "translateY(-5px)" },
        bg: { base: "rgba(255,255,255,0.14)", md: "rgba(30,60,100,0.60)" },
        borderColor: { base: "rgba(255,255,255,0.18)", md: "rgba(255,255,255,0.40)" },
      }}
      _active={{ transform: { base: "scale(0.99)", md: "translateY(-3px)" } }}
    >
      <Stack
        direction={{ base: "row", md: "column" }}
        spacing={{ base: 3, md: 3 }}
        align={{ base: "center", md: "center" }}
        textAlign={{ base: "left", md: "center" }}
      >
        <Flex
          w={{ base: "40px", md: "42px" }}
          h={{ base: "40px", md: "42px" }}
          borderRadius="12px"
          bg={{ base: "rgba(255,255,255,0.12)", md: "whiteAlpha.200" }}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} w={{ base: 4, md: 5 }} h={{ base: 4, md: 5 }} />
        </Flex>

        <Box w="100%">
          <Text fontSize={{ base: "md", md: "xl" }} fontWeight="700" lineHeight="1.2">
            {title}
          </Text>

          <Divider display={{ base: "none", md: "block" }} borderColor="whiteAlpha.400" my={3} />

          <Text
            fontSize={{ base: "sm", md: "sm" }}
            opacity={{ base: 0.82, md: 0.92 }}
            noOfLines={{ base: 1, md: 2 }}
            mt={{ base: 0.5, md: 0 }}
          >
            {description}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

// FŐOLDAL
export default function Fooldal() {
  return (
    <Box
      minH="100vh"
      fontFamily="'Inter', sans-serif"
      overflowX="hidden"
      bgColor={mountainBottomColor}
      bgImage={{
        base: `url('${mobileHero}')`,
        md: `url('${desktopHero}')`,
      }}
      bgRepeat="no-repeat"
      bgPosition={{
        base: "top center",
        md: "top center",
      }}
      bgSize={{
        base: "cover",
        md: "contain",
      }}
      color="white"
      pb={{ base: 10, md: 20 }}
      position="relative"
    >
      {/* Overlay - mobilon erősebb, hogy olvasható legyen a szöveg */}
      <Box
        position="absolute"
        inset="0"
        bgGradient={{
          base:
            "linear(to-b, rgba(10,18,36,0.55) 0%, rgba(10,18,36,0.30) 40%, rgba(39,111,179,0.75) 90%)",
          md:
            "linear(to-b, rgba(10,18,36,0.22) 0%, rgba(10,18,36,0.08) 35%, rgba(39,111,179,0.60) 85%)",
        }}
        pointerEvents="none"
      />

      <Container
        maxW="container.xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        {/* HERO */}
        <Flex
          direction="column"
          align="stretch"
          pt={{ base: "56px", md: "140px", lg: "180px" }}
          mb={{ base: 6, md: "180px", lg: "220px" }}
        >
          {/* Mobilon hero panel: kisebb, csendesebb */}
          <Box
            maxW={{ base: "100%", md: "680px" }}
            mx={{ base: "auto", md: 0 }}
            textAlign={{ base: "center", md: "left" }}
            bg={{ base: "rgba(0,0,0,0.28)", md: "transparent" }}
            border={{ base: "1px solid", md: "none" }}
            borderColor={{ base: "whiteAlpha.200", md: "transparent" }}
            borderRadius={{ base: "16px", md: "0px" }}
            p={{ base: 4, sm: 5, md: 0 }}
            backdropFilter={{ base: "blur(8px)", md: "none" }}
            boxShadow={{ base: "none", md: "none" }}
          >
            <VStack spacing={{ base: 3, md: 4 }} align={{ base: "center", md: "flex-start" }}>
              <Text
                fontSize={{ base: "34px", sm: "40px", md: "6xl", lg: "7xl" }}
                fontWeight="extrabold"
                letterSpacing="-0.02em"
                lineHeight={{ base: "1.06", md: "1.0" }}
                textShadow={{ base: "none", md: "0 12px 30px rgba(0,0,0,0.30)" }}
              >
                GuideMate
              </Text>

              <Text
                fontSize={{ base: "sm", sm: "md", md: "2xl" }}
                opacity={0.9}
                lineHeight="1.5"
                maxW={{ base: "38ch", md: "unset" }}
              >
                Egy hely, ahol minden utazásod életre kel.
              </Text>

              {/* Gombok: mobilon egymás alatt */}
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={{ base: 3, md: 4 }}
                pt={{ base: 2, md: 2 }}
                w={{ base: "100%", md: "auto" }}
              >
                <Button
                  as={RouterLink}
                  to="/utazastervezo"
                  size="lg"
                  h={{ base: "48px", md: "52px" }}
                  bg="white"
                  color="#1e293b"
                  fontWeight="bold"
                  fontSize={{ base: "sm", md: "md" }}
                  px={{ base: 6, md: 8 }}
                  borderRadius="12px"
                  boxShadow={{ base: "none", md: "0 12px 30px rgba(255, 255, 255, 0.28)" }}
                  _active={{ transform: "scale(0.99)" }}
                  _hover={{ bg: "gray.100" }}
                  w={{ base: "100%", md: "auto" }}
                >
                  Utazástervezés megnyitása
                </Button>

                <Button
                  as={RouterLink}
                  to="/terkep"
                  size="lg"
                  h={{ base: "48px", md: "52px" }}
                  bg="#273a68"
                  color="white"
                  fontWeight="bold"
                  fontSize={{ base: "sm", md: "md" }}
                  px={{ base: 6, md: 8 }}
                  borderRadius="12px"
                  _hover={{ bg: "#354a80" }}
                  _active={{ transform: "scale(0.99)" }}
                  w={{ base: "100%", md: "auto" }}
                >
                  Térkép böngészése
                </Button>
              </Stack>
            </VStack>
          </Box>
        </Flex>

        {/* KÁRTYÁK / FEATURE szekció: mobilon NINCS extra üveg panel (kevesebb vizuális zaj) */}
        <Box
          bg={{ base: "transparent", md: "transparent" }}
          border={{ base: "none", md: "none" }}
          borderColor={{ base: "transparent", md: "transparent" }}
          borderRadius={{ base: "0px", md: "0px" }}
          p={{ base: 0, md: 0 }}
          backdropFilter={{ base: "none", md: "none" }}
          boxShadow={{ base: "none", md: "none" }}
        >
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <HStack justify="space-between" align="center">
              <Text fontSize={{ base: "md", md: "2xl" }} fontWeight="700">
                Fedezd fel a lehetőségeket
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 3, md: 6 }}>
              <FeatureCard
                title="Utazástervezés"
                icon={FaBus}
                description="Készíts saját utazásokat, napokra bontva"
                to="/utazastervezo"
              />
              <FeatureCard
                title="Térkép"
                icon={FaMapMarkerAlt}
                description="Fedezd fel a városokat és látnivalókat"
                to="/terkep"
              />
              <FeatureCard
                title="Jegykövetés"
                icon={FaFolderOpen}
                description="Add hozzá repülőjegyeidet és kövesd őket"
                to="/jegykovetes"
              />
            </SimpleGrid>
          </VStack>
        </Box>

        {/* LÁBLÉC CTA: mobilon kisebb, egyszerűbb */}
        <Box
          mt={{ base: 8, md: 16 }}
          bg={{ base: "rgba(255,255,255,0.10)", md: "rgba(255,255,255,0.12)" }}
          border="1px solid rgba(255,255,255,0.2)"
          borderRadius={{ base: "16px", md: "20px" }}
          p={{ base: 4, md: 10 }}
          textAlign="center"
          backdropFilter={{ base: "blur(8px)", md: "blur(10px)" }}
          boxShadow={{ base: "none", md: "none" }}
        >
          <VStack spacing={{ base: 3, md: 4 }}>
            <Text fontSize={{ base: "lg", md: "3xl" }} fontWeight="800">
              Lépj be a GuideMate utazók közé
            </Text>

            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={{ base: 3, md: 4 }}
              align="center"
              justify="center"
              w="100%"
            >
              <Button
                as={RouterLink}
                to="/bejelentkezes"
                size="lg"
                h={{ base: "48px", md: "52px" }}
                bg="#F6D365"
                color="#333"
                fontWeight="bold"
                fontSize={{ base: "sm", md: "md" }}
                px={{ base: 8, md: 12 }}
                borderRadius="12px"
                w={{ base: "100%", md: "auto" }}
              >
                Belépés
              </Button>

              <Button
                as={RouterLink}
                to="/regisztracio"
                size="lg"
                h={{ base: "48px", md: "52px" }}
                bg="rgba(255,255,255,0.18)"
                color="white"
                fontWeight="600"
                fontSize={{ base: "sm", md: "md" }}
                px={{ base: 8, md: 12 }}
                borderRadius="12px"
                border="1px solid rgba(255,255,255,0.5)"
                _hover={{ bg: "rgba(255,255,255,0.28)" }}
                w={{ base: "100%", md: "auto" }}
              >
                Regisztráció
              </Button>
            </Stack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
