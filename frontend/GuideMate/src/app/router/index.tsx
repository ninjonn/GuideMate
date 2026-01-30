import { createBrowserRouter } from "react-router-dom";
import NavigaciosSav from "../layout/NavigaciosSav";
import AuthGuard from "./AuthGuard";

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
      <AuthGuard>
        <>
          <NavigaciosSav />
          <UtazastervezoOldal />
        </>
      </AuthGuard>
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
      <AuthGuard>
        <>
          <NavigaciosSav />
          <UtReszletekOldal />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/jegykovetes",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <JegyKovetesOldal />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/profil",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <ProfilOldal />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <AdminOldal />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/uj-jegy",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <UjJegyForm />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/jegy-szerkesztes/:id",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <UjJegyForm />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/uj-ut-hozzaadasa",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <UjUtHozzaadasaOldal />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "/utazas-szerkesztese/:id",
    element: (
      <AuthGuard>
        <>
          <NavigaciosSav />
          <UtazasSzerkeszteseOldal />
        </>
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <NemTalalhato />,
  },
]);
