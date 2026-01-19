import { createBrowserRouter } from "react-router-dom";
import NavigaciosSav from "../layout/NavigaciosSav";

// OLDALAK IMPORTÁLÁSA
import Fooldal from "../../oldalak/Fooldal/Fooldal";
import BejelentkezesOldal from "../../oldalak/BejelentkezesOldal/BejelentkezesOldal";
import RegisztracioOldal from "../../oldalak/RegisztracioOldal/RegisztracioOldal";
import TerkepOldal from "../../oldalak/TerkepOldal/TerkepOldal";
import UtazastervezoOldal from "../../oldalak/UtazastervezoOldal/UtazastervezoOldal";
import JegyKovetesOldal from "../../oldalak/JegyKovetesOldal/JegyKovetesOldal";
import ProfilOldal from "../../oldalak/ProfilOldal/ProfilOldal";
import AdminOldal from "../../oldalak/AdminOldal/AdminOldal";
import NemTalalhato from "../../oldalak/NemTalalhato/NemTalalhato";
import UjJegyForm from "../../oldalak/JegyKovetesOldal/UjJegyForm";
import UjUtHozzaadasaOldal from "../../oldalak/UtazastervezoOldal/UjUtHozzaadasaOldal";
import UtazasSzerkeszteseOldal from "../../oldalak/UtazastervezoOldal/UtazasSzerkeszteseOldal";
import UtReszletekOldal from "../../oldalak/UtReszletekOldal/UtReszletekOldal";

// ROUTER EXPORTJA
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <NavigaciosSav />
        <Fooldal />
      </>
    ),
  },
  {
    path: "/bejelentkezes",
    element: (
      <>
        <NavigaciosSav />
        <BejelentkezesOldal />
      </>
    ),
  },
  {
    path: "/regisztracio",
    element: (
      <>
        <NavigaciosSav />
        <RegisztracioOldal />
      </>
    ),
  },
  {
    path: "/utazastervezo",
    element: (
      <>
        <NavigaciosSav />
        <UtazastervezoOldal />
      </>
    ),
  },
  {
    path: "/terkep",
    element: (
      <>
        <NavigaciosSav />
        <TerkepOldal />
      </>
    ),
  },
  {
    path: "/utazas/:id",
    element: (
      <>
        <NavigaciosSav />
        <UtReszletekOldal />
      </>
    ),
  },
  {
    path: "/jegykovetes",
    element: (
      <>
        <NavigaciosSav />
        <JegyKovetesOldal />
      </>
    ),
  },
  {
    path: "/profil",
    element: (
      <>
        <NavigaciosSav />
        <ProfilOldal />
      </>
    ),
  },
  {
    path: "/admin",
    element: (
      <>
        <NavigaciosSav />
        <AdminOldal />
      </>
    ),
  },
  {
    path: "/uj-jegy",
    element: (
      <>
        <NavigaciosSav />
        <UjJegyForm />
      </>
    ),
  },
  {
    path: "/uj-ut-hozzaadasa",
    element: (
      <>
        <NavigaciosSav />
        <UjUtHozzaadasaOldal />
      </>
    ),
  },
  {
    path: "/utazas-szerkesztese/:id",
    element: (
      <>
        <NavigaciosSav />
        <UtazasSzerkeszteseOldal />
      </>
    ),
  },
  {
    path: "*",
    element: <NemTalalhato />,
  },
]);
