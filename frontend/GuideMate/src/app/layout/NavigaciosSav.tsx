import { useEffect, useState } from "react";
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
import { getProfile } from "../../features/auth/auth.api";
import { setAuthToken } from "../../lib/api";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      const token = localStorage.getItem("gm_token");
      const raw = localStorage.getItem("gm_user");
      let storedRole: string | undefined;

      if (raw) {
        try {
          const user = JSON.parse(raw) as { szerepkor?: string } | null;
          storedRole = user?.szerepkor;
        } catch {
          storedRole = undefined;
        }
      }

      if (!token) {
        if (mounted) {
          setIsAuthed(false);
          setIsAdmin(false);
        }
        return;
      }

      if (mounted) setIsAuthed(true);

      if (storedRole === "admin") {
        if (mounted) setIsAdmin(true);
        return;
      }

      setAuthToken(token);
      try {
        const profile = await getProfile();
        if (!mounted) return;
        setIsAdmin(profile.szerepkor === "admin");
        localStorage.setItem(
          "gm_user",
          JSON.stringify({
            azonosito: profile.azonosito,
            nev: profile.nev,
            email: profile.email,
            szerepkor: profile.szerepkor,
          }),
        );
      } catch {
        if (mounted) setIsAdmin(false);
      }
    };

    void loadRole();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const menuItems = [
    { label: "Főoldal", to: "/" },
    { label: "Térkép", to: "/terkep" },
    ...(isAuthed
      ? [
          { label: "Utazástervezés", to: "/utazastervezo" },
          { label: "Jegykövetés", to: "/jegykovetes" },
          ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []),
        ]
      : []),
  ];

  const getLinkStyles = (isActive: boolean) => ({
    bg: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    hoverBg: isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)",
    backdropFilter: isActive ? "blur(4px)" : "none",
  });

  return (
    <>
      {/* --- ELMOSÓDOTT HÁTTÉR (BACKDROP) --- */}
      {/* Csak akkor jelenik meg, ha a menü nyitva van */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="rgba(0, 0, 0, 0.4)" // Sötétítés
          backdropFilter="blur(8px)" // Elmosás
          zIndex="999" // A tartalom felett, de a menü alatt
          onClick={onClose} // Ha a háttérre kattintasz, záródjon be
        />
      )}

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
          <Flex flex={{ base: "0", md: "1" }} align="center">
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
          </Flex>

          <HStack
            spacing={6}
            display={{ base: "none", md: "flex" }}
            flex="1"
            justify="center"
          >
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

          <Flex
            flex="1"
            display={{ base: "none", md: "flex" }}
            align="center"
            justify="flex-end"
          >
            <Flex
              as={RouterLink}
              to={isAuthed ? "/profil" : "/bejelentkezes"}
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
          </Flex>

          <IconButton
            display={{ md: "none" }}
            aria-label="Menu"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            color="white"
            fontSize="24px"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={isOpen ? onClose : onOpen}
            zIndex="1001" // Hogy a backdrop fölött legyen
          />
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Box
            mt={4}
            p={4}
            display={{ md: "none" }}
            bg="rgba(20, 30, 60, 0.85)" 
            backdropFilter="blur(20px)" 
            borderRadius="16px"
            border="1px solid rgba(255, 255, 255, 0.2)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.4)"
            position="relative" // Fontos a zIndex miatt
            zIndex="1001"
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
                    onClick={onClose} 
                    w="100%"
                    textAlign="center"
                    fontSize="18px"
                    fontWeight="500"
                    py={3} 
                    borderRadius="12px"
                    transition="all 0.3s ease"
                    bg={isActive ? "rgba(255, 255, 255, 0.25)" : "transparent"}
                    _hover={{
                      textDecoration: "none",
                      bg: "rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    {item.label}
                  </ChakraLink>
                );
              })}
              
              <ChakraLink
                as={RouterLink}
                to={isAuthed ? "/profil" : "/bejelentkezes"}
                onClick={onClose}
                w="100%"
                textAlign="center"
                fontSize="18px"
                fontWeight="500"
                py={3}
                borderRadius="12px"
                transition="all 0.3s ease"
                _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                border="1px solid rgba(255, 255, 255, 0.25)"
                mt={3}
              >
                <HStack justify="center" spacing={3}>
                   <ProfileIcon boxSize={5} />
                   <Text>{isAuthed ? "Profil" : "Bejelentkezés"}</Text>
                </HStack>
              </ChakraLink>

            </VStack>
          </Box>
        </Collapse>
      </Box>
    </>
  );
}
