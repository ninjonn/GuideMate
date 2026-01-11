import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Center,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";

const UjJegyForm: React.FC = () => {
  return (
    <Box
      minH="100vh"
      w="100vw"
      bgGradient="linear(to-tr, #A9E4FD 2%, #285CB0 80%)"
      color="white"
      pt={{ base: 24, md: 32 }}
      pb={20}
      px={4}
    >
      <Center>
        <Box
          w={{ base: "100%", md: "700px" }}
          bg="rgba(255,255,255,0.1)"
          backdropFilter="blur(12px)"
          borderRadius="15px"
          border="1px solid rgba(255,255,255,0.2)"
          boxShadow="0 20px 40px rgba(0,0,0,0.2)"
          p={10}
        >
          <VStack spacing={8}>
            <Heading fontSize="3xl" fontWeight="700">
              Új jegy hozzáadása
            </Heading>

            <Text fontSize="md" textAlign="center" color="whiteAlpha.900">
              Add meg az utazás adatait és mentsd el a jegyek közé.
            </Text>

            {/* Utazás típusa */}
            <FormControl>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FaPlane} color="white" />
                </InputLeftElement>
                <Input
                  placeholder="Utazás típusa (pl. repülő, busz)"
                  variant="flushed"
                  borderBottom="1px solid rgba(255,255,255,0.5)"
                  _placeholder={{ color: "#ffffffa0" }}
                  _focus={{ borderColor: "white", boxShadow: "none" }}
                  color="white"
                  fontSize="lg"
                  pl={10}
                />
              </InputGroup>
            </FormControl>

            {/* Honnan */}
            <FormControl>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FaMapMarkerAlt} color="white" />
                </InputLeftElement>
                <Input
                  placeholder="Honnan"
                  variant="flushed"
                  borderBottom="1px solid rgba(255,255,255,0.5)"
                  _placeholder={{ color: "#ffffffa0" }}
                  _focus={{ borderColor: "white", boxShadow: "none" }}
                  color="white"
                  fontSize="lg"
                  pl={10}
                />
              </InputGroup>
            </FormControl>

            {/* Hová */}
            <FormControl>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FaMapMarkerAlt} color="white" />
                </InputLeftElement>
                <Input
                  placeholder="Hová"
                  variant="flushed"
                  borderBottom="1px solid rgba(255,255,255,0.5)"
                  _placeholder={{ color: "#ffffffa0" }}
                  _focus={{ borderColor: "white", boxShadow: "none" }}
                  color="white"
                  fontSize="lg"
                  pl={10}
                />
              </InputGroup>
            </FormControl>

            {/* Indulás */}
            <FormControl>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FaCalendarAlt} color="white" />
                </InputLeftElement>
                <Input
                  placeholder="Indulás dátuma és ideje"
                  type="datetime-local"
                  variant="flushed"
                  borderBottom="1px solid rgba(255,255,255,0.5)"
                  _focus={{ borderColor: "white", boxShadow: "none" }}
                  color="white"
                  fontSize="lg"
                  pl={10}
                />
              </InputGroup>
            </FormControl>

            {/* Érkezés */}
            <FormControl>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FaClock} color="white" />
                </InputLeftElement>
                <Input
                  placeholder="Érkezés dátuma és ideje"
                  type="datetime-local"
                  variant="flushed"
                  borderBottom="1px solid rgba(255,255,255,0.5)"
                  _focus={{ borderColor: "white", boxShadow: "none" }}
                  color="white"
                  fontSize="lg"
                  pl={10}
                />
              </InputGroup>
            </FormControl>

            {/* Mentés gomb */}
            <Button
              w="100%"
              h="55px"
              bg="#232B5C"
              color="white"
              fontWeight="700"
              fontSize="lg"
              borderRadius="lg"
              _hover={{ filter: "brightness(1.2)", transform: "scale(1.02)" }}
              boxShadow="0 4px 15px rgba(0,0,0,0.2)"
            >
              Jegy mentése
            </Button>

            {/* Vissza */}
            <Text fontSize="sm" color="whiteAlpha.800">
              Vissza a{" "}
              <RouterLink
                to="/jegykovetes"
                style={{ textDecoration: "underline", fontWeight: 600 }}
              >
                Jegykövetés oldalra
              </RouterLink>
            </Text>
          </VStack>
        </Box>
      </Center>
    </Box>
  );
};

export default UjJegyForm;