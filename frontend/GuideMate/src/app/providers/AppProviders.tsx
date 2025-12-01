import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { ReactNode } from "react";

const theme = extendTheme({});

interface Props {
  children: ReactNode;
}

export default function AppProviders({ children }: Props) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}