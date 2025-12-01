import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { ReactNode } from "react";

const theme = extendTheme({});

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
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
export default function AppProviders({ children }: Props) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}