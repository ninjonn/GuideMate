import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import JegyKovetesOldal from "../JegyKovetesOldal";
import {
  deleteFoglalas,
  listFoglalasok,
  type Foglalas,
} from "../../../features/foglalas/foglalas.api";

vi.mock("../../../features/foglalas/foglalas.api", () => ({
  listFoglalasok: vi.fn(),
  deleteFoglalas: vi.fn(),
}));

const mockFoglalasok: Foglalas[] = [
  {
    azonosito: 1,
    tipus: "busz",
    indulasi_hely: "Budapest",
    erkezesi_hely: "Bécs",
    indulasi_ido: "2024-01-01T08:00:00.000Z",
    erkezesi_ido: "2024-01-01T10:00:00.000Z",
    jaratszam: "B123",
  },
  {
    azonosito: 2,
    tipus: "szallas",
    hely: "Hotel Lanchid",
    cim: "Budapest, Fo utca 1",
    kezdo_datum: "2024-01-01",
    veg_datum: "2024-01-02",
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/jegykovetes"]}>
      <Routes>
        <Route path="/jegykovetes" element={<JegyKovetesOldal />} />
      </Routes>
    </MemoryRouter>,
  );

const setup = async () => {
  const user = userEvent.setup();
  renderPage();
  await screen.findByText("busz");
  return { user };
};

describe("JegyKovetesOldal", () => {
  beforeEach(() => {
    vi.mocked(listFoglalasok).mockResolvedValue(mockFoglalasok);
    vi.mocked(deleteFoglalas).mockResolvedValue({ sikeres: true });
  });

  it("szűri a listát keresés alapján", async () => {
    const { user } = await setup();

    await user.type(
      screen.getByPlaceholderText("Keresés típus / hely / járatszám alapján"),
      "hotel",
    );

    expect(screen.getByText("Hotel Lanchid")).toBeInTheDocument();
    expect(screen.queryByText("busz")).not.toBeInTheDocument();
  });
});
