-- CreateTable
CREATE TABLE "Felhasznalo" (
    "felhsznalo_id" SERIAL NOT NULL,
    "nev" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jelszo" TEXT NOT NULL,
    "szerepkor" TEXT,

    CONSTRAINT "Felhasznalo_pkey" PRIMARY KEY ("felhsznalo_id")
);

-- CreateTable
CREATE TABLE "Helyszin" (
    "helyszin_id" SERIAL NOT NULL,
    "orszag" TEXT NOT NULL,
    "varos" TEXT NOT NULL,
    "iranyitoszam" TEXT,
    "utca" TEXT NOT NULL,
    "hazszam" TEXT,
    "szelesseg" DECIMAL(10,7),
    "hosszusag" DECIMAL(10,7),

    CONSTRAINT "Helyszin_pkey" PRIMARY KEY ("helyszin_id")
);

-- CreateTable
CREATE TABLE "Utazas" (
    "utazas_id" SERIAL NOT NULL,
    "nev" TEXT NOT NULL,
    "leiras" TEXT,
    "kezdo_datum" TIMESTAMP(3),
    "veg_datum" TIMESTAMP(3),

    CONSTRAINT "Utazas_pkey" PRIMARY KEY ("utazas_id")
);

-- CreateTable
CREATE TABLE "UtazasResztvevo" (
    "utazas_id" INTEGER NOT NULL,
    "felhasznalo_id" INTEGER NOT NULL,
    "szerep" TEXT,
    "csatlakozas_ideje" TIMESTAMP(3),

    CONSTRAINT "UtazasResztvevo_pkey" PRIMARY KEY ("utazas_id","felhasznalo_id")
);

-- CreateTable
CREATE TABLE "Latnivalo" (
    "latnivalo_id" SERIAL NOT NULL,
    "helyszin_id" INTEGER NOT NULL,
    "nev" TEXT NOT NULL,
    "kategoria" TEXT,
    "kep_url" TEXT,
    "leiras" TEXT,

    CONSTRAINT "Latnivalo_pkey" PRIMARY KEY ("latnivalo_id")
);

-- CreateTable
CREATE TABLE "Program" (
    "program_id" SERIAL NOT NULL,
    "utazas_id" INTEGER NOT NULL,
    "program_nev" TEXT NOT NULL,
    "nap_datum" TIMESTAMP(3),

    CONSTRAINT "Program_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "ProgramLatnivalo" (
    "program_id" INTEGER NOT NULL,
    "latnivalo_id" INTEGER NOT NULL,
    "tipus" TEXT NOT NULL,
    "sorrend" INTEGER NOT NULL,

    CONSTRAINT "ProgramLatnivalo_pkey" PRIMARY KEY ("program_id","latnivalo_id")
);

-- CreateTable
CREATE TABLE "Foglalas" (
    "foglalas_id" SERIAL NOT NULL,
    "utazas_id" INTEGER NOT NULL,
    "foglalas_tipus" TEXT NOT NULL,
    "indulasi_hely" TEXT NOT NULL,
    "erkezesi_hely" TEXT NOT NULL,
    "indulasi_ido" TIMESTAMP(3) NOT NULL,
    "erkezesi_ido" TIMESTAMP(3) NOT NULL,
    "jaratszam" TEXT,

    CONSTRAINT "Foglalas_pkey" PRIMARY KEY ("foglalas_id")
);

-- CreateTable
CREATE TABLE "EllenorzoLista" (
    "lista_id" SERIAL NOT NULL,
    "utazas_id" INTEGER NOT NULL,
    "lista_nev" TEXT NOT NULL,

    CONSTRAINT "EllenorzoLista_pkey" PRIMARY KEY ("lista_id")
);

-- CreateTable
CREATE TABLE "ListaElem" (
    "elem_id" SERIAL NOT NULL,
    "lista_id" INTEGER NOT NULL,
    "megnevezes" TEXT NOT NULL,
    "kipipalva" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ListaElem_pkey" PRIMARY KEY ("elem_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Felhasznalo_email_key" ON "Felhasznalo"("email");

-- AddForeignKey
ALTER TABLE "UtazasResztvevo" ADD CONSTRAINT "UtazasResztvevo_utazas_id_fkey" FOREIGN KEY ("utazas_id") REFERENCES "Utazas"("utazas_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtazasResztvevo" ADD CONSTRAINT "UtazasResztvevo_felhasznalo_id_fkey" FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo"("felhsznalo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Latnivalo" ADD CONSTRAINT "Latnivalo_helyszin_id_fkey" FOREIGN KEY ("helyszin_id") REFERENCES "Helyszin"("helyszin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_utazas_id_fkey" FOREIGN KEY ("utazas_id") REFERENCES "Utazas"("utazas_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramLatnivalo" ADD CONSTRAINT "ProgramLatnivalo_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramLatnivalo" ADD CONSTRAINT "ProgramLatnivalo_latnivalo_id_fkey" FOREIGN KEY ("latnivalo_id") REFERENCES "Latnivalo"("latnivalo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foglalas" ADD CONSTRAINT "Foglalas_utazas_id_fkey" FOREIGN KEY ("utazas_id") REFERENCES "Utazas"("utazas_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EllenorzoLista" ADD CONSTRAINT "EllenorzoLista_utazas_id_fkey" FOREIGN KEY ("utazas_id") REFERENCES "Utazas"("utazas_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListaElem" ADD CONSTRAINT "ListaElem_lista_id_fkey" FOREIGN KEY ("lista_id") REFERENCES "EllenorzoLista"("lista_id") ON DELETE RESTRICT ON UPDATE CASCADE;
