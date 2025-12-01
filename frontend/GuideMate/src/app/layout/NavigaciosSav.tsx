import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  useDisclosure,
  IconButton,
  Icon,
  Text,
  type IconProps,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";

const ProfileIcon = (props: IconProps) => (
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

export default function NavigaciosSav() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const menuItems = [
    { label: "Főoldal", to: "/" },
    { label: "Térkép", to: "/terkep" },
    { label: "Utazástervezés", to: "/utazastervezo" },
    { label: "Jegykövetés", to: "/jegykovetes" },
  ];

  return (
    <Box
      w="100%"
      bgGradient="linear(to-r, #63A4FF, #417BFB)"
      px={{ base: 4, md: 8 }}
      py={4}
      color="white"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Flex align="center" justify="space-between" maxW="1440px" mx="auto">
        {/* LOGÓ */}
        <Text
          fontSize="36px"
          fontWeight="700"
          lineHeight="110%"
          letterSpacing="-0.02em"
          textShadow="0 4px 4px rgba(0,0,0,0.25)"
        >
          GuideMate
        </Text>

        {/* DESKTOP MENÜ */}
        <HStack spacing={10} display={{ base: "none", md: "flex" }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <ChakraLink
                key={item.to}
                as={RouterLink}
                to={item.to}
                fontSize="20px"
                fontWeight="500"
                px={6} // több padding, hogy téglalap legyen
                py={3}
                borderRadius="12px" // ← Figma szerinti enyhe lekerekítés
                bg={isActive ? "rgba(255,255,255,0.25)" : "transparent"} // Figma stílus
                color="white"
                transition="0.2s"
                _hover={{
                  bg: "rgba(255,255,255,0.18)", // kicsit halványabb hover
                  textDecoration: "none",
                }}
              >
                {item.label}
              </ChakraLink>
            );
          })}
        </HStack>

        {/* PROFIL IKON */}
        <Flex
          as={RouterLink}
          to="/profil"
          display={{ base: "none", md: "flex" }}
          align="center"
          justify="center"
          w="42px"
          h="42px"
          borderRadius="12px"
          border="1px solid white"
          cursor="pointer"
          transition="0.2s"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          <ProfileIcon boxSize={6} />
        </Flex>

        {/* MOBIL HAMBURGER */}
        <IconButton
          display={{ md: "none" }}
          aria-label="Menu"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.20)" }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>
    </Box>
  );
}
export default function NavigaciosSav() {
  return (
    <nav>
      Navigációs sáv
    </nav>
  );
}
