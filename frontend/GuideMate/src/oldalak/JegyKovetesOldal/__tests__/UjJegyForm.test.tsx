import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UjJegyForm from "../UjJegyForm";

vi.mock("../../../komponensek/ui/ChakraDatePicker", () => ({
  default: () => <div data-testid="chakra-date-picker" />,
}));

const renderForm = () =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={["/uj-jegy"]}>
        <Routes>
          <Route path="/uj-jegy" element={<UjJegyForm />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );

const setup = () => {
  const user = userEvent.setup();
  renderForm();
  return { user };
};

describe("UjJegyForm", () => {
  it("autó típusnál elrejti a járatszám mezőt", async () => {
    const { user } = setup();

    expect(screen.getByText("Járatszám (opcionális)")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "auto");

    expect(
      screen.queryByText("Járatszám (opcionális)"),
    ).not.toBeInTheDocument();
  });
});
