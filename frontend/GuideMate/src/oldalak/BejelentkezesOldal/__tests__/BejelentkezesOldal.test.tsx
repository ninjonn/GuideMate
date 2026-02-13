import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BejelentkezesOldal from "../BejelentkezesOldal";
import { login } from "../../../features/auth/auth.api";

vi.mock("../../../features/auth/auth.api", () => ({
  login: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/bejelentkezes"]}>
      <Routes>
        <Route path="/bejelentkezes" element={<BejelentkezesOldal />} />
        <Route path="/profil" element={<div>Profil</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("BejelentkezesOldal", () => {
  const setup = () => {
    const user = userEvent.setup();
    renderPage();
    return { user };
  };

  it("meghívja a bejelentkezést a megadott adatokkal", async () => {
    const { user } = setup();
    vi.mocked(login).mockResolvedValue({
      token: "token-123",
      felhasznalo: {
        azonosito: 1,
        nev: "Teszt Elek",
        email: "teszt@example.com",
        szerepkor: "user",
      },
    });
    localStorage.clear();

    await user.type(screen.getByPlaceholderText("Email"), "teszt@example.com");
    await user.type(screen.getByPlaceholderText("Jelszó"), "titkosjelszo");
    await user.click(screen.getByRole("button", { name: "Bejelentkezés" }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: "teszt@example.com",
        jelszo: "titkosjelszo",
      }),
    );

    expect(localStorage.getItem("gm_token")).toBe("token-123");
  });
});
