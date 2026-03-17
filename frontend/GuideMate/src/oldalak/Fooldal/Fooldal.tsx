import React from "react";
import { Box, Container } from "@chakra-ui/react";
import { FaBus, FaMapMarkerAlt, FaFolderOpen } from "react-icons/fa";
import FeatureSzekcio from "./komponensek/FeatureSzekcio";
import HeroSzekcio from "./komponensek/HeroSzekcio";
import CtaSzekcio from "./komponensek/CtaSzekcio";
import type { FeatureKartyaProps } from "./komponensek/FeatureKartya";

// KÉPEK
const desktopHero = "/assets/hero-plane-desktop.png";
const mobileHero = "/assets/hero-plane-mobil.png";

// FŐ SZÍN
const mountainBottomColor = "#276fb3";

const featureItems: FeatureKartyaProps[] = [
  {
    title: "Utazástervezés",
    icon: FaBus,
    description: "Készíts saját utazásokat, napokra bontva",
    to: "/utazastervezo",
  },
  {
    title: "Térkép",
    icon: FaMapMarkerAlt,
    description: "Fedezd fel a városokat és látnivalókat",
    to: "/terkep",
  },
  {
    title: "Jegykövetés",
    icon: FaFolderOpen,
    description: "Add hozzá repülőjegyeidet és kövesd őket",
    to: "/jegykovetes",
  },
];

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
        <HeroSzekcio />
        <FeatureSzekcio items={featureItems} />
        <CtaSzekcio />
      </Container>
    </Box>
  );
}
