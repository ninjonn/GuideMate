import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RegisztracioOldal from "../RegisztracioOldal";
import { register } from "../../../features/auth/auth.api";

vi.mock("../../../features/auth/auth.api", () => ({
  register: vi.fn(),
}));

const renderPage = () =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={["/regisztracio"]}>
        <Routes>
          <Route path="/regisztracio" element={<RegisztracioOldal />} />
          <Route path="/bejelentkezes" element={<div>Bejelentkezés</div>} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );

describe("RegisztracioOldal", () => {
  const setup = () => {
    const user = userEvent.setup();
    renderPage();
    return { user };
  };

  it("nem hívja meg a regisztrációt hiányzó mezőknél", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Regisztráció" }));

    expect(register).not.toHaveBeenCalled();
  });

  it("nem hívja meg a regisztrációt eltérő jelszavaknál", async () => {
    const { user } = setup();

    await user.type(screen.getByPlaceholderText("Vezetéknév"), "Teszt");
    await user.type(screen.getByPlaceholderText("Keresztnév"), "Elek");
    await user.type(screen.getByPlaceholderText("Email"), "teszt@example.com");
    await user.type(screen.getByPlaceholderText("Jelszó"), "titkos1");
    await user.type(screen.getByPlaceholderText("Jelszó megerősítése"), "titkos2");

    await user.click(screen.getByRole("button", { name: "Regisztráció" }));

    expect(register).not.toHaveBeenCalled();
  });

  it("meghívja a regisztrációt helyes adatokkal", async () => {
    const { user } = setup();
    vi.mocked(register).mockResolvedValue({
      azonosito: 1,
      nev: "Teszt Elek",
      email: "teszt@example.com",
      szerepkor: "user",
      regisztracio_datum: "2024-01-01",
    });

    await user.type(screen.getByPlaceholderText("Vezetéknév"), "  Teszt");
    await user.type(screen.getByPlaceholderText("Keresztnév"), "Elek ");
    await user.type(screen.getByPlaceholderText("Email"), " teszt@example.com ");
    await user.type(screen.getByPlaceholderText("Jelszó"), "titkos1");
    await user.type(screen.getByPlaceholderText("Jelszó megerősítése"), "titkos1");

    await user.click(screen.getByRole("button", { name: "Regisztráció" }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        vezeteknev: "Teszt",
        keresztnev: "Elek",
        email: "teszt@example.com",
        jelszo: "titkos1",
      }),
    );
  });
});
