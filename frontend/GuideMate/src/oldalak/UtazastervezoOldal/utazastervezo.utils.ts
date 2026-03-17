import type { UtazasListItem } from '../../features/utazas/utazas.api';
import type { Trip } from './utazastervezo.types';

export const calcDays = (start: string, end: string): number => {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;
  const diff = Math.max(0, endMs - startMs);
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

export const mapListItemToTrip = (item: UtazasListItem): Trip => {
  return {
    id: item.azonosito,
    title: item.cim,
    description: item.leiras ?? '',
    startDate: item.kezdo_datum,
    endDate: item.veg_datum,
    days: calcDays(item.kezdo_datum, item.veg_datum),
    programs: item.programok_szama,
    checklistDone: 0,
    checklistTotal: item.ellenorzolistak_szama ?? 0,
  };
};
