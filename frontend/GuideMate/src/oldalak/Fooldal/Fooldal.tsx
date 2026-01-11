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
const mountainBottomColor = "rgb(30, 90, 131)";

// CTA kártya
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  to,
}) => {
  return (
    <Box
      as={RouterLink}
      to={to}
      position="relative"
      bg="rgba(30, 60, 100, 0.4)"
      backdropFilter="blur(10px)"
      borderRadius="16px"
      border="1px solid rgba(255,255,255,0.2)"
      p={8}
      textAlign="center"
      color="white"
      transition="0.3s"
      boxShadow="lg"
      height="180px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      _hover={{
        transform: "translateY(-5px)",
        bg: "rgba(30,60,100,0.6)",
        borderColor: "rgba(255,255,255,0.4)",
      }}
    >
      <VStack spacing={3}>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Divider borderColor="whiteAlpha.400" w="60%" />
        <Icon as={icon} w={8} h={8} />
        <Text fontSize="sm" opacity={0.9} maxW="200px">
          {description}
        </Text>
      </VStack>
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
      backgroundImage={{
        base: `url('${mobileHero}')`,
        md: `url('${desktopHero}')`,
      }}
      backgroundRepeat="no-repeat"
      backgroundPosition="top center"

      // Mobil
      // ultrawide: két oldalt kitölt a háttérszín)
      backgroundSize={{ base: "cover", md: "contain" }}

      color="white"
      pb={20}
    >
      <Container maxW="container.xl" px={4}>
        {/* HERO SZEKCIÓ */}
        <VStack
          spacing={2}
          textAlign="center"
          pt={{ base: "60px", md: "120px", lg: "180px" }}
          mb={{ base: "120px", md: "260px", lg: "310px" }}
        >
          <Text
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight="extrabold"
            letterSpacing="-0.02em"
          >
            GuideMate
          </Text>

          <Text fontSize={{ base: "lg", md: "2xl" }} opacity={0.9}>
            Egy hely, ahol minden utazásod életre kel.
          </Text>
        </VStack>

        {/* GOMBOK */}
        <Flex justify="center" gap={4} wrap="wrap">
          <Button
            as={RouterLink}
            to="/utazastervezo"
            size="lg"
            h="56px"
            bg="white"
            color="#1e293b"
            fontWeight="bold"
            px={8}
            borderRadius="6px"
            _hover={{ bg: "gray.100" }}
          >
            Utazástervezés megnyitása
          </Button>

          <Button
            as={RouterLink}
            to="/terkep"
            size="lg"
            h="56px"
            bg="#273a68"
            color="white"
            fontWeight="bold"
            px={8}
            borderRadius="6px"
            _hover={{ bg: "#354a80" }}
          >
            Térkép böngészése
          </Button>
        </Flex>

        {/* KÁRTYÁK */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mt={20}>
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

        {/* LÁBLÉC CTA */}
        <VStack spacing={6} textAlign="center" pt={16}>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
            Lépj be a GuideMate utazók közé
          </Text>

          <Button
            as={RouterLink}
            to="/bejelentkezes"
            size="lg"
            bg="#F6D365"
            color="#333"
            fontWeight="bold"
            px={12}
            borderRadius="6px"
          >
            Belépés
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}