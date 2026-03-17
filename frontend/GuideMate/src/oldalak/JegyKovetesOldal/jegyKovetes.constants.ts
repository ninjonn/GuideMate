import type { Foglalas } from "../../features/foglalas/foglalas.api";

export const TIPUS_LABEL: Record<Foglalas["tipus"], string> = {
  repulo: "repülő",
  busz: "busz",
  vonat: "vonat",
  auto: "autó",
  szallas: "szállás",
};
