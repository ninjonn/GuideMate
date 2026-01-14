import {
  Box,
  Flex,
  HStack,
  VStack,
  Collapse,
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
  
  // Ez figyeli, hogy melyik URL-en vagyunk éppen
  const location = useLocation();

  const menuItems = [
    { label: "Főoldal", to: "/" },
    { label: "Térkép", to: "/terkep" },
    { label: "Utazástervezés", to: "/utazastervezo" },
    { label: "Jegykövetés", to: "/jegykovetes" },
  ];

  // Helper function a stílusokhoz
  const getLinkStyles = (isActive: boolean) => ({
    bg: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
    hoverBg: isActive ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)",
    backdropFilter: isActive ? "blur(4px)" : "none",
  });

  return (
    <Box
      as="nav"
      w="100%"
      bg="transparent"
      position="absolute"
      top="0"
      left="0"
      right="0"
      px={{ base: 4, md: 8 }}
      py={6}
      color="white"
      zIndex="1000"
    >
      <Flex align="center" justify="space-between" maxW="1440px" mx="auto">
        {/* LOGÓ */}
        <Text
          fontSize="32px"
          fontWeight="700"
          lineHeight="110%"
          letterSpacing="-0.02em"
          textShadow="0 4px 4px rgba(0,0,0,0.25)"
          cursor="pointer"
        >
          GuideMate
        </Text>

        {/* DESKTOP MENÜ */}
        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            const styles = getLinkStyles(isActive);

            return (
              <ChakraLink
                key={item.to}
                as={RouterLink}
                to={item.to}
                fontSize="18px"
                fontWeight="400"
                px={5} 
                py={2.5} 
                borderRadius="12px"
                transition="all 0.3s ease"
                bg={styles.bg}
                backdropFilter={styles.backdropFilter}
                _hover={{
                  textDecoration: "none",
                  bg: styles.hoverBg,
                }}
              >
                {item.label}
              </ChakraLink>
            );
          })}
        </HStack>

        {/* PROFIL IKON (Desktop) */}
        <Flex
          as={RouterLink}
          to="/profil"
          display={{ base: "none", md: "flex" }}
          align="center"
          justify="center"
          w="48px"
          h="48px"
          borderRadius="14px"
          border="1px solid rgba(255, 255, 255, 0.4)"
          cursor="pointer"
          transition="0.2s"
          _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
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
          fontSize="24px"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>

      {/* MOBIL MENÜ */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          mt={4}
          p={4}
          display={{ md: "none" }}
          // Glassmorphism konténer stílus mindennél 
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(12px)"
          borderRadius="12px"
          border="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.15)"
        >
          <VStack spacing={2} align="stretch">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              const styles = getLinkStyles(isActive);

              return (
                <ChakraLink
                  key={item.to}
                  as={RouterLink}
                  to={item.to}
                  onClick={onClose} // Menü bezárása kattintáskor
                  w="100%"
                  textAlign="center"
                  fontSize="18px"
                  fontWeight="500"
                  py={3} // 48-56px magasság elérése a paddinggal
                  borderRadius="12px"
                  transition="all 0.3s ease"
                  bg={styles.bg}
                  _hover={{
                    textDecoration: "none",
                    bg: styles.hoverBg,
                  }}
                >
                  {item.label}
                </ChakraLink>
              );
            })}
            
            {/* Opcionális: Profil gomb a mobil menü aljára, ha szükséges */}
            <ChakraLink
              as={RouterLink}
              to="/profil"
              onClick={onClose}
              w="100%"
              textAlign="center"
              fontSize="18px"
              fontWeight="500"
              py={3}
              borderRadius="12px"
              transition="all 0.3s ease"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              border="1px solid rgba(255, 255, 255, 0.2)"
              mt={2}
            >
              <HStack justify="center" spacing={3}>
                 <ProfileIcon boxSize={5} />
                 <Text>Profil</Text>
              </HStack>
            </ChakraLink>

          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}
/*export default function NavigaciosSav() {
  return (
    <nav>
      Navigációs sáv
    </nav>
  );
}*/
