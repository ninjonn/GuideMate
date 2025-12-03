/*
  Warnings:

  - Made the column `szerepkor` on table `Felhasznalo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kezdo_datum` on table `Utazas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `veg_datum` on table `Utazas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Felhasznalo" ALTER COLUMN "szerepkor" SET NOT NULL;

-- AlterTable
ALTER TABLE "Utazas" ALTER COLUMN "kezdo_datum" SET NOT NULL,
ALTER COLUMN "veg_datum" SET NOT NULL;

-- CreateTable
CREATE TABLE "UserAccessToken" (
    "token_id" TEXT NOT NULL,
    "felhasznalo_id" INTEGER NOT NULL,
    "nev" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccessToken_pkey" PRIMARY KEY ("token_id")
);

-- CreateIndex
CREATE INDEX "UserAccessToken_felhasznalo_id_idx" ON "UserAccessToken"("felhasznalo_id");

-- AddForeignKey
ALTER TABLE "UserAccessToken" ADD CONSTRAINT "UserAccessToken_felhasznalo_id_fkey" FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo"("felhsznalo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
