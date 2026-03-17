import { useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEllenorzoLista, listEllenorzoLista } from '../../features/ellenorzo-lista/ellenorzo-lista.api';
import { createListaElem, deleteListaElem, updateListaElem } from '../../features/lista-elem/lista-elem.api';
import { createProgram, deleteProgram, updateProgram } from '../../features/program/program.api';
import { getUtazas, updateUtazas } from '../../features/utazas/utazas.api';
import type { ChecklistItem, EventItem } from './utReszletek.types';
import {
  addDays,
  calcDayCount,
  clampDay,
  formatDuration,
  parseDateOnly,
  parseMinutes,
} from './utReszletek.utils';

const DEFAULT_TRIP_TITLE = "Párizsi kirándulás";

export const useUtReszletek = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const eventModal = useDisclosure();
  const checklistAddModal = useDisclosure();
  const mobileChecklistModal = useDisclosure();

  const [tripTitle, setTripTitle] = useState(DEFAULT_TRIP_TITLE);
  const [tripStart, setTripStart] = useState<string | null>(null);
  const [tripEnd, setTripEnd] = useState<string | null>(null);

  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<number[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activeListaId, setActiveListaId] = useState<number | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const daysScrollRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const handleToggleCheck = async (itemId: number) => {
    const current = checklist.find((item) => item.id === itemId);
    if (!current || !activeListaId) return;
    const nextChecked = !current.checked;
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: nextChecked } : item)),
    );
    try {
      await updateListaElem(itemId, { kipipalva: nextChecked });
    } catch (err) {
      setChecklist((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, checked: current.checked } : item)),
      );
    }
  };

  const handleBack = () => {
    navigate('/utazastervezo');
  };

  const handleAddDay = async () => {
    if (!tripStart || !tripEnd || !id) return;
    const utazasId = Number(id);
    const nextEnd = addDays(tripEnd, 1);
    try {
      await updateUtazas(utazasId, { veg_datum: nextEnd });
      await loadTrip(utazasId);
      toast({ title: 'Új nap hozzáadva', status: 'success' });
    } catch (err) {
      toast({ title: 'Hiba', status: 'error' });
    }
  };

  const handleDeleteDaysFrom = async (day: number) => {
    if (!tripStart || !id) return;
    const utazasId = Number(id);
    if (day <= 1) return;
    const nextEnd = addDays(tripStart, day - 2);
    const programsToDelete = events.filter((event) => event.dayId >= day);
    if (programsToDelete.length > 0) {
      await Promise.allSettled(programsToDelete.map((event) => deleteProgram(event.id)));
      setEvents((prev) => prev.filter((event) => event.dayId < day));
    }
    try {
      await updateUtazas(utazasId, { veg_datum: nextEnd });
      setTripEnd(nextEnd);
      await loadTrip(utazasId);
      toast({ title: 'Napok törölve', status: 'success' });
    } catch (err) {
      toast({ title: 'Hiba', status: 'error' });
    }
  };

  const handleOpenNewEvent = () => {
    setEditingEventId(null);
    setNewEventTitle("");
    setNewEventStart("");
    setNewEventEnd("");
    setNewEventDescription("");
    eventModal.onOpen();
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventStart(event.timeStart);
    setNewEventEnd(event.timeEnd);
    setNewEventDescription(event.description ?? "");
    eventModal.onOpen();
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!id) return;
    try {
      await deleteProgram(eventId);
      await loadTrip(Number(id));
      toast({ title: 'Törölve', status: 'success' });
    } catch (err) {
      toast({ title: 'Hiba', status: 'error' });
    }
  };

  const handleExportDay = async () => {
    if (!exportRef.current) return;
    const element = exportRef.current;
    const prevOverflow = element.style.overflow;
    const prevMaxHeight = element.style.maxHeight;
    const hiddenEls: Array<{ el: HTMLElement; display: string }> = [];
    const scrollEls: Array<{ el: HTMLElement; overflow: string; maxHeight: string; height: string }> = [];
    const exportClass = 'export-mode-black-text';
    let styleEl: HTMLStyleElement | null = null;
    try {
      const exportHides = element.querySelectorAll<HTMLElement>('[data-export-hide]');
      exportHides.forEach((el) => {
        hiddenEls.push({ el, display: el.style.display });
        el.style.display = 'none';
      });
      const exportScrolls = element.querySelectorAll<HTMLElement>('[data-export-scroll]');
      exportScrolls.forEach((el) => {
        scrollEls.push({
          el,
          overflow: el.style.overflow,
          maxHeight: el.style.maxHeight,
          height: el.style.height,
        });
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = `${el.scrollHeight}px`;
      });
      element.classList.add(exportClass);
      styleEl = document.createElement('style');
      styleEl.textContent = `
        .${exportClass}, .${exportClass} * {
          color: #000 !important;
        }
      `;
      document.head.appendChild(styleEl);
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      const safeTitle = (tripTitle || 'utazas').replace(/\s+/g, '_').toLowerCase();
      link.download = `${safeTitle}_nap_${activeDay}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'Exportálva', status: 'success' });
    } catch (err) {
      toast({ title: 'Nem sikerült exportálni', status: 'error' });
    } finally {
      element.style.overflow = prevOverflow;
      element.style.maxHeight = prevMaxHeight;
      element.classList.remove(exportClass);
      if (styleEl) {
        styleEl.remove();
      }
      scrollEls.forEach(({ el, overflow, maxHeight, height }) => {
        el.style.overflow = overflow;
        el.style.maxHeight = maxHeight;
        el.style.height = height;
      });
      hiddenEls.forEach(({ el, display }) => {
        el.style.display = display;
      });
    }
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !newEventStart) {
      toast({ title: 'Hiányzó adatok', status: 'warning' });
      return;
    }
    if (!id || !tripStart) return;
    try {
      const safeEnd = newEventEnd || newEventStart;
      if (editingEventId) {
        await updateProgram(editingEventId, {
          nev: newEventTitle.trim(),
          leiras: newEventDescription.trim() ? newEventDescription.trim() : undefined,
          kezdo_ido: newEventStart,
          veg_ido: safeEnd,
        });
      } else {
        const napDatum = addDays(tripStart, activeDay - 1);
        await createProgram(Number(id), {
          nev: newEventTitle.trim(),
          leiras: newEventDescription.trim() ? newEventDescription.trim() : undefined,
          nap_datum: napDatum,
          kezdo_ido: newEventStart,
          veg_ido: safeEnd,
        });
      }
      await loadTrip(Number(id));
      eventModal.onClose();
      setNewEventDescription("");
      toast({ title: 'Siker', status: 'success' });
    } catch (err) {
      toast({ title: 'Hiba', status: 'error' });
    }
  };

  const handleAddChecklistItem = () => {
    setNewItemName("");
    checklistAddModal.onOpen();
  };

  const confirmAddChecklistItem = async () => {
    if (!id) return;
    const name = newItemName.trim();
    if (!name) return;
    try {
      let listaId = activeListaId;
      if (!listaId) {
        const created = await createEllenorzoLista(Number(id), { lista_nev: 'Ellenőrzőlista' });
        listaId = created.lista_id;
        setActiveListaId(listaId);
      }
      const createdItem = await createListaElem(listaId!, { megnevezes: name });
      setChecklist((prev) => [
        ...prev,
        { id: createdItem.elem_id, text: createdItem.megnevezes, checked: false },
      ]);
      checklistAddModal.onClose();
    } catch (err) {
      toast({ title: 'Hiba', status: 'error' });
    }
  };

  const handleDeleteChecked = async () => {
    if (!activeListaId) return;
    const toDelete = checklist.filter((item) => item.checked);
    if (toDelete.length === 0) return;
    try {
      await Promise.all(toDelete.map((item) => deleteListaElem(item.id)));
      setChecklist((prev) => prev.filter((item) => !item.checked));
      toast({ title: 'Törölve', status: 'success' });
    } catch (err) {
      toast({ title: 'Hiba', status: 'error' });
    }
  };

  const loadTrip = async (utazasId: number) => {
    const res = await getUtazas(utazasId);
    setTripTitle(res.cim || DEFAULT_TRIP_TITLE);
    setTripStart(res.kezdo_datum);
    setTripEnd(res.veg_datum);
    const dayCount = calcDayCount(res.kezdo_datum, res.veg_datum);
    const safeDayCount = dayCount > 0 ? dayCount : 1;
    setDays(Array.from({ length: safeDayCount }, (_, idx) => idx + 1));
    setActiveDay((prev) => clampDay(prev, safeDayCount));

    const baseDate = res.kezdo_datum;
    const base = parseDateOnly(baseDate);
    const mappedEvents: EventItem[] = res.programok.map((program) => {
      const napDatum = program.nap_datum ?? baseDate;
      const nap = parseDateOnly(napDatum);
      const dayId =
        base && nap
          ? Math.floor((nap.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 1;
      return {
        id: program.azonosito,
        dayId,
        timeStart: program.kezdo_ido,
        timeEnd: program.veg_ido,
        title: program.nev,
        description: program.leiras,
      };
    });
    setEvents(mappedEvents);
  };

  const loadChecklist = async (utazasId: number) => {
    try {
      const res = await listEllenorzoLista(utazasId);
      const lista = res.ellenorzolistak[0];
      if (lista) {
        setActiveListaId(lista.lista_id);
        setChecklist(
          lista.elemek.map((elem) => ({
            id: elem.elem_id,
            text: elem.megnevezes,
            checked: elem.kipipalva,
          })),
        );
      }
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      void loadTrip(Number(id));
      void loadChecklist(Number(id));
    }
  }, [id]);

  useEffect(() => {
    const container = daysScrollRef.current;
    if (!container) return;
    const activeButton = container.querySelector<HTMLButtonElement>(`[data-day="${activeDay}"]`);
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeDay, days.length]);

  const sortedEvents = useMemo(
    () => events.filter((e) => e.dayId === activeDay).sort((a, b) => a.timeStart.localeCompare(b.timeStart)),
    [events, activeDay],
  );

  const totalDurationString = useMemo(() => {
    let totalMinutes = 0;
    sortedEvents.forEach((event) => {
      const start = parseMinutes(event.timeStart);
      const end = parseMinutes(event.timeEnd);
      if (end > start) totalMinutes += end - start;
      else if (end < start) totalMinutes += 24 * 60 - start + end;
    });
    return totalMinutes > 0 ? formatDuration(totalMinutes) : '0 perc';
  }, [sortedEvents]);

  return {
    tripTitle,
    days,
    activeDay,
    setActiveDay,
    sortedEvents,
    totalDurationString,
    checklist,
    newEventTitle,
    newEventStart,
    newEventEnd,
    newEventDescription,
    editingEventId,
    newItemName,
    daysScrollRef,
    exportRef,
    eventModal,
    checklistAddModal,
    mobileChecklistModal,
    setNewEventTitle,
    setNewEventStart,
    setNewEventEnd,
    setNewEventDescription,
    setNewItemName,
    handleBack,
    handleAddDay,
    handleDeleteDaysFrom,
    handleOpenNewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleSaveEvent,
    handleToggleCheck,
    handleAddChecklistItem,
    confirmAddChecklistItem,
    handleDeleteChecked,
    handleExportDay,
  };
};
