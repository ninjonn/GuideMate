import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Select,
  Button,
  Input,
  IconButton,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import type { ResztvevoItem } from "../../../features/utazas/utazas.api";

type Props = {
  resztvevok: ResztvevoItem[];
  sajatSzerep: string | null;
  loading: boolean;
  onInvite: (email: string, szerep: "szerkeszto" | "megtekineto") => Promise<void>;
  onRemove: (targetId: number) => Promise<void>;
  onChangeRole: (targetId: number, szerep: "szerkeszto" | "megtekineto") => Promise<void>;
};

const SZEREP_LABEL: Record<string, string> = {
  tulajdonos: "Tulajdonos",
  szerkeszto: "Szerkesztő",
  megtekineto: "Megtekintő",
};

const ResztvevoKezeles: React.FC<Props> = ({
  resztvevok,
  sajatSzerep,
  loading,
  onInvite,
  onRemove,
  onChangeRole,
}) => {
  const [email, setEmail] = useState("");
  const [ujSzerep, setUjSzerep] = useState<"szerkeszto" | "megtekineto">("szerkeszto");
  const [inviting, setInviting] = useState(false);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await onInvite(email.trim(), ujSzerep);
      setEmail("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hiba történt");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (
    targetId: number,
    szerep: "szerkeszto" | "megtekineto",
  ) => {
    setChangingId(targetId);
    try {
      await onChangeRole(targetId, szerep);
    } catch {
      // toast a hook-ban
    } finally {
      setChangingId(null);
    }
  };

  return (
    <Box bg="#F7FAFC" borderRadius="xl" p={5} color="#2D3748">
      <Heading size="sm" color="#1E2A4F" mb={4}>
        Utazótársak
      </Heading>

      {loading ? (
        <Spinner size="sm" color="#1E2A4F" />
      ) : (
        <VStack align="stretch" spacing={3} mb={4}>
          {resztvevok.map((r) => (
            <Box key={r.felhasznalo_id}>
              <HStack justify="space-between" mb={sajatSzerep === "tulajdonos" && r.szerep !== "tulajdonos" ? 1 : 0}>
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                    {r.nev}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {r.email}
                  </Text>
                </Box>
                <HStack flexShrink={0}>
                  {r.szerep === "tulajdonos" ? (
                    <Text fontSize="xs" fontWeight="600" color="purple.600">
                      {SZEREP_LABEL[r.szerep]}
                    </Text>
                  ) : sajatSzerep === "tulajdonos" ? (
                    <>
                      <Select
                        size="xs"
                        value={r.szerep}
                        onChange={(e) =>
                          void handleRoleChange(
                            r.felhasznalo_id,
                            e.target.value as "szerkeszto" | "megtekineto",
                          )
                        }
                        bg="white"
                        isDisabled={changingId === r.felhasznalo_id}
                        w="110px"
                      >
                        <option value="szerkeszto">Szerkesztő</option>
                        <option value="megtekineto">Megtekintő</option>
                      </Select>
                      <IconButton
                        aria-label="Eltávolít"
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => void onRemove(r.felhasznalo_id)}
                      />
                    </>
                  ) : (
                    <Text fontSize="xs" color="gray.500">
                      {SZEREP_LABEL[r.szerep] ?? r.szerep}
                    </Text>
                  )}
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {sajatSzerep === "tulajdonos" && (
        <>
          <Divider borderColor="gray.200" mb={3} />
          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="600">
            Meghívó küldése
          </Text>
          <Input
            placeholder="email@pelda.hu"
            size="sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleInvite();
            }}
            mb={2}
            bg="white"
          />
          <HStack mb={error ? 2 : 0}>
            <Select
              size="sm"
              value={ujSzerep}
              onChange={(e) =>
                setUjSzerep(e.target.value as "szerkeszto" | "megtekineto")
              }
              bg="white"
            >
              <option value="szerkeszto">Szerkesztő</option>
              <option value="megtekineto">Megtekintő</option>
            </Select>
            <Button
              size="sm"
              bg="#1E2A4F"
              color="white"
              _hover={{ bg: "#151d36" }}
              onClick={() => void handleInvite()}
              isLoading={inviting}
              flexShrink={0}
            >
              Meghív
            </Button>
          </HStack>
          {error && (
            <Text fontSize="xs" color="red.500">
              {error}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export default ResztvevoKezeles;
