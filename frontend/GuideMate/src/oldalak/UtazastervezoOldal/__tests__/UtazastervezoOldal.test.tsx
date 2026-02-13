import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UtazastervezoOldal from "../UtazastervezoOldal";
import { renderWithChakra } from "../../../test/utils";
import type { Trip } from "../utazastervezo.types";

const useUtazastervezoMock = vi.fn();

vi.mock("../useUtazastervezo", () => ({
  useUtazastervezo: () => useUtazastervezoMock(),
}));

const baseState = {
  checklistModal: { isOpen: false, onOpen: vi.fn(), onClose: vi.fn() },
  checklist: [],
  trips: [],
  loadingTrips: false,
  loadError: null,
  newItemName: "",
  setNewItemName: vi.fn(),
  handleEditTrip: vi.fn(),
  handleOpenTrip: vi.fn(),
  handleDeleteTrip: vi.fn(),
  handleToggleItem: vi.fn(),
  handleAddItemClick: vi.fn(),
  confirmAddItem: vi.fn(),
  handleDeleteChecked: vi.fn(),
  handleSaveChecklist: vi.fn(),
  handleAddTripClick: vi.fn(),
};

const mockState = (overrides = {}) => {
  useUtazastervezoMock.mockReturnValue({ ...baseState, ...overrides });
};

const baseTrips: Trip[] = [
  {
    id: 1,
    title: "Balaton",
    description: "Nyari pihenes",
    startDate: "2024-07-01",
    endDate: "2024-07-05",
    days: 5,
    programs: 3,
    checklistDone: 1,
    checklistTotal: 4,
  },
];

describe("UtazastervezoOldal", () => {
  it("megjeleníti az utazásokat és kezeli az új út gombot", async () => {
    const user = userEvent.setup();
    const handleAddTripClick = vi.fn();

    mockState({ trips: baseTrips, handleAddTripClick });

    renderWithChakra(<UtazastervezoOldal />);

    expect(screen.getByText("Balaton")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "új út hozzáadása" }));
    expect(handleAddTripClick).toHaveBeenCalledTimes(1);
  });

  it("betöltésnél megjeleníti a státuszt", () => {
    mockState({ loadingTrips: true });

    renderWithChakra(<UtazastervezoOldal />);

    expect(screen.getByText("Betöltés...")).toBeInTheDocument();
  });
});
