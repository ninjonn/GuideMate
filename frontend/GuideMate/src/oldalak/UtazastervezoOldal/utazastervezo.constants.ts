import type { ChecklistItem } from "./utazastervezo.types";

export const initialChecklist: ChecklistItem[] = [
  { id: 1, text: "Útlevél", isChecked: false },
  { id: 2, text: "Hátizsák", isChecked: false },
  { id: 3, text: "Szemüveg", isChecked: true },
  { id: 4, text: "Pénztárca", isChecked: false },
  { id: 5, text: "Víz", isChecked: false },
  { id: 6, text: "Sapka", isChecked: false },
];
