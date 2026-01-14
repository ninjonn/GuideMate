import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { setAuthToken } from "../../lib/api";

interface Props {
  children: ReactNode;
}

const theme = extendTheme({
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
});

export default function AppProviders({ children }: Props) {
  useEffect(() => {
    // Ha volt korábbi login, töltsük be a token-t az API kliensbe.
    const token = localStorage.getItem("gm_token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
