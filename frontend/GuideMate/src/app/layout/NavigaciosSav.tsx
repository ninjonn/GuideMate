import { Box, Flex, IconButton } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import MenuHatter from "./komponensek/MenuHatter";
import NavigaciosLinkek from "./komponensek/NavigaciosLinkek";
import ProfilGomb from "./komponensek/ProfilGomb";
import MobilMenu from "./komponensek/MobilMenu";
import NavigacioLogo from "./komponensek/NavigacioLogo";
import { useNavigacio } from "./useNavigacio";

export default function NavigaciosSav() {
  const { disclosure, location, isAuthed, menuItems, getLinkStyles } = useNavigacio();
  const { isOpen, onOpen, onClose } = disclosure;

  return (
    <>
      {/* --- ELMOSÓDOTT HÁTTÉR (BACKDROP) --- */}
      {/* Csak akkor jelenik meg, ha a menü nyitva van */}
      <MenuHatter isOpen={isOpen} onClose={onClose} />

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
          <NavigacioLogo />

          <NavigaciosLinkek
            menuItems={menuItems}
            activePath={location.pathname}
            getLinkStyles={getLinkStyles}
          />

          <ProfilGomb isAuthed={isAuthed} />

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

        <MobilMenu
          isOpen={isOpen}
          onClose={onClose}
          menuItems={menuItems}
          activePath={location.pathname}
          isAuthed={isAuthed}
        />
      </Box>
    </>
  );
}
