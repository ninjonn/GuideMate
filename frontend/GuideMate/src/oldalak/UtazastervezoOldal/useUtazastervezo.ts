import { useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createEllenorzoLista, listEllenorzoLista } from '../../features/ellenorzo-lista/ellenorzo-lista.api';
import { createListaElem, deleteListaElem, updateListaElem } from '../../features/lista-elem/lista-elem.api';
import { deleteUtazas, listUtazasok } from '../../features/utazas/utazas.api';
import type { ChecklistItem, Trip } from './utazastervezo.types';
import { mapListItemToTrip } from './utazastervezo.utils';
import { initialChecklist } from './utazastervezo.constants';

export const useUtazastervezo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const checklistModal = useDisclosure();

  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [activeListaId, setActiveListaId] = useState<number | null>(null);

  const [newItemName, setNewItemName] = useState("");

  const handleEditTrip = (id: number) => {
    navigate(`/utazas-szerkesztese/${id}`);
  };

  const handleOpenTrip = (id: number) => {
    navigate(`/utazas/${id}`);
  };

  const handleDeleteTrip = async (id: number) => {
    if (!window.confirm("Biztosan törlöd ezt az utazást?")) {
      return;
    }

    try {
      await deleteUtazas(id);
      setTrips((prev) => {
        const next = prev.filter((trip) => trip.id !== id);
        if (activeTripId === id) {
          setActiveTripId(next[0]?.id ?? null);
          setChecklist([]);
          setActiveListaId(null);
        }
        return next;
      });
      toast({
        title: "Utazás törölve",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Törlés sikertelen",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleToggleItem = async (id: number) => {
    const current = checklist.find((item) => item.id === id);
    if (!current) return;
    if (!activeListaId) {
      toast({ title: "Nincs ellenőrzőlista", status: "warning", duration: 2000 });
      return;
    }

    const nextChecked = !current.isChecked;
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: nextChecked } : item,
      ),
    );

    try {
      await updateListaElem(id, { kipipalva: nextChecked });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isChecked: current.isChecked } : item,
        ),
      );
      toast({
        title: "Nem sikerült frissíteni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddItemClick = () => {
    setNewItemName("");
    checklistModal.onOpen();
  };

  const confirmAddItem = async () => {
    if (newItemName.trim() === "") {
      toast({ title: "Adj meg egy nevet!", status: "warning", duration: 2000 });
      return;
    }
    if (!activeTripId) {
      toast({ title: "Nincs kiválasztott utazás", status: "warning", duration: 2000 });
      return;
    }

    try {
      let listaId = activeListaId;
      if (!listaId) {
        const createdList = await createEllenorzoLista(activeTripId, {
          lista_nev: "Utazó ellenőrzőlista",
        });
        listaId = createdList.lista_id;
        setActiveListaId(listaId);
      }

      const createdItem = await createListaElem(listaId, {
        megnevezes: newItemName.trim(),
      });

      const newItem: ChecklistItem = {
        id: createdItem.elem_id,
        text: createdItem.megnevezes,
        isChecked: createdItem.kipipalva,
      };
      setChecklist((prev) => [...prev, newItem]);
      checklistModal.onClose();
      toast({ title: "Elem hozzáadva", status: "success", duration: 1500 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült hozzáadni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteChecked = async () => {
    const toDelete = checklist.filter((item) => item.isChecked);
    if (toDelete.length === 0) {
      toast({ title: "Nincs kijelölt elem", status: "warning", duration: 1000 });
      return;
    }
    if (!activeListaId) {
      toast({ title: "Nincs ellenőrzőlista", status: "warning", duration: 2000 });
      return;
    }

    try {
      await Promise.all(toDelete.map((item) => deleteListaElem(item.id)));
      setChecklist((prev) => prev.filter((item) => !item.isChecked));
      toast({ title: "Kijelölt elemek törölve", status: "success", duration: 1000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült törölni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveChecklist = async () => {
    if (!activeTripId) {
      toast({ title: "Nincs kiválasztott utazás", status: "warning", duration: 2000 });
      return;
    }
    try {
      const res = await listEllenorzoLista(activeTripId);
      const lista = res.ellenorzolistak[0];
      if (!lista) {
        setChecklist([]);
        setActiveListaId(null);
      } else {
        setActiveListaId(lista.lista_id);
        setChecklist(
          lista.elemek.map((elem) => ({
            id: elem.elem_id,
            text: elem.megnevezes,
            isChecked: elem.kipipalva,
          })),
        );
      }
      toast({ title: "Lista mentve", status: "success", duration: 2000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast({
        title: "Nem sikerült frissíteni",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddTripClick = () => {
    navigate('/uj-ut-hozzaadasa');
  };

  useEffect(() => {
    const state = location.state as { ujTrip?: Trip; frissitettTrip?: Trip } | null;
    if (state?.ujTrip || state?.frissitettTrip) {
      setTrips((prev) => {
        let next = [...prev];
        if (state.frissitettTrip) {
          const idx = next.findIndex((t) => t.id === state.frissitettTrip!.id);
          if (idx >= 0) {
            next[idx] = state.frissitettTrip!;
          } else {
            next = [...next, state.frissitettTrip!];
          }
        }
        if (state.ujTrip && !next.some((t) => t.id === state.ujTrip!.id)) {
          next = [...next, state.ujTrip!];
        }
        return next;
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTrips(true);
        setLoadError(null);
        const res = await listUtazasok();
        const mapped: Trip[] = res.utazasok.map(mapListItemToTrip);
        setTrips(mapped);
        if (!activeTripId && mapped.length > 0) {
          setActiveTripId(mapped[0].id);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
        setLoadError(msg);
        toast({
          title: "Nem sikerült betölteni az utazásokat",
          description: msg,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoadingTrips(false);
      }
    };

    void load();
  }, [toast]);

  useEffect(() => {
    const loadChecklist = async () => {
      if (!activeTripId) {
        setChecklist([]);
        setActiveListaId(null);
        return;
      }
      try {
        const res = await listEllenorzoLista(activeTripId);
        const lista = res.ellenorzolistak[0];
        if (!lista) {
          setChecklist([]);
          setActiveListaId(null);
          return;
        }
        setActiveListaId(lista.lista_id);
        setChecklist(
          lista.elemek.map((elem) => ({
            id: elem.elem_id,
            text: elem.megnevezes,
            isChecked: elem.kipipalva,
          })),
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
        toast({
          title: "Nem sikerült betölteni a listát",
          description: msg,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };

    void loadChecklist();
  }, [activeTripId, toast]);

  return {
    checklistModal,
    checklist,
    trips,
    loadingTrips,
    loadError,
    newItemName,
    setNewItemName,
    handleEditTrip,
    handleOpenTrip,
    handleDeleteTrip,
    handleToggleItem,
    handleAddItemClick,
    confirmAddItem,
    handleDeleteChecked,
    handleSaveChecklist,
    handleAddTripClick,
  };
};
