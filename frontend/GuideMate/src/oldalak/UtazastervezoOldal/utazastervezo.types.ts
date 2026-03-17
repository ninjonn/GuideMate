export type ChecklistItem = {
  id: number;
  text: string;
  isChecked: boolean;
};

export type Trip = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  days: number;
  programs: number;
  checklistDone: number;
  checklistTotal: number;
};
