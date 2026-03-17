export type EventItem = {
  id: number;
  dayId: number;
  timeStart: string;
  timeEnd: string;
  title: string;
  description?: string | null;
};

export type ChecklistItem = {
  id: number;
  text: string;
  checked: boolean;
};
