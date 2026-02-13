import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";

export const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};
