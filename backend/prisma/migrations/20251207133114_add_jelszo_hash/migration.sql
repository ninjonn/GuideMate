-- CreateTable
CREATE TABLE `Felhasznalo` (
    `felhasznalo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nev` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `jelszo_hash` VARCHAR(191) NOT NULL,
    `szerepkor` VARCHAR(191) NOT NULL DEFAULT 'felhasznalo',
    `letrehozva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Felhasznalo_email_key`(`email`),
    PRIMARY KEY (`felhasznalo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAccessToken` (
    `token_id` VARCHAR(191) NOT NULL,
    `felhasznalo_id` INTEGER NOT NULL,
    `nev` VARCHAR(191) NOT NULL,
    `date_created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiration` DATETIME(3) NOT NULL,

    INDEX `UserAccessToken_felhasznalo_id_idx`(`felhasznalo_id`),
    PRIMARY KEY (`token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Helyszin` (
    `helyszin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `orszag` VARCHAR(191) NOT NULL,
    `varos` VARCHAR(191) NOT NULL,
    `iranyitoszam` VARCHAR(191) NULL,
    `utca` VARCHAR(191) NOT NULL,
    `hazszam` VARCHAR(191) NULL,
    `szelesseg` DECIMAL(10, 7) NULL,
    `hosszusag` DECIMAL(10, 7) NULL,

    PRIMARY KEY (`helyszin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Utazas` (
    `utazas_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nev` VARCHAR(191) NOT NULL,
    `leiras` VARCHAR(191) NULL,
    `kezdo_datum` DATETIME(3) NOT NULL,
    `veg_datum` DATETIME(3) NOT NULL,

    PRIMARY KEY (`utazas_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtazasResztvevo` (
    `utazas_id` INTEGER NOT NULL,
    `felhasznalo_id` INTEGER NOT NULL,
    `szerep` VARCHAR(191) NULL,
    `csatlakozas_ideje` DATETIME(3) NULL,

    PRIMARY KEY (`utazas_id`, `felhasznalo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Latnivalo` (
    `latnivalo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `helyszin_id` INTEGER NOT NULL,
    `nev` VARCHAR(191) NOT NULL,
    `kategoria` VARCHAR(191) NULL,
    `kep_url` VARCHAR(191) NULL,
    `leiras` VARCHAR(191) NULL,

    PRIMARY KEY (`latnivalo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Program` (
    `program_id` INTEGER NOT NULL AUTO_INCREMENT,
    `utazas_id` INTEGER NOT NULL,
    `program_nev` VARCHAR(191) NOT NULL,
    `nap_datum` DATETIME(3) NULL,

    PRIMARY KEY (`program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramLatnivalo` (
    `program_id` INTEGER NOT NULL,
    `latnivalo_id` INTEGER NOT NULL,
    `tipus` VARCHAR(191) NOT NULL,
    `sorrend` INTEGER NOT NULL,

    PRIMARY KEY (`program_id`, `latnivalo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Foglalas` (
    `foglalas_id` INTEGER NOT NULL AUTO_INCREMENT,
    `utazas_id` INTEGER NOT NULL,
    `foglalas_tipus` VARCHAR(191) NOT NULL,
    `indulasi_hely` VARCHAR(191) NOT NULL,
    `erkezesi_hely` VARCHAR(191) NOT NULL,
    `indulasi_ido` DATETIME(3) NOT NULL,
    `erkezesi_ido` DATETIME(3) NOT NULL,
    `jaratszam` VARCHAR(191) NULL,

    PRIMARY KEY (`foglalas_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EllenorzoLista` (
    `lista_id` INTEGER NOT NULL AUTO_INCREMENT,
    `utazas_id` INTEGER NOT NULL,
    `lista_nev` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`lista_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListaElem` (
    `elem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lista_id` INTEGER NOT NULL,
    `megnevezes` VARCHAR(191) NOT NULL,
    `kipipalva` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`elem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAccessToken` ADD CONSTRAINT `UserAccessToken_felhasznalo_id_fkey` FOREIGN KEY (`felhasznalo_id`) REFERENCES `Felhasznalo`(`felhasznalo_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtazasResztvevo` ADD CONSTRAINT `UtazasResztvevo_utazas_id_fkey` FOREIGN KEY (`utazas_id`) REFERENCES `Utazas`(`utazas_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtazasResztvevo` ADD CONSTRAINT `UtazasResztvevo_felhasznalo_id_fkey` FOREIGN KEY (`felhasznalo_id`) REFERENCES `Felhasznalo`(`felhasznalo_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Latnivalo` ADD CONSTRAINT `Latnivalo_helyszin_id_fkey` FOREIGN KEY (`helyszin_id`) REFERENCES `Helyszin`(`helyszin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_utazas_id_fkey` FOREIGN KEY (`utazas_id`) REFERENCES `Utazas`(`utazas_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramLatnivalo` ADD CONSTRAINT `ProgramLatnivalo_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `Program`(`program_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramLatnivalo` ADD CONSTRAINT `ProgramLatnivalo_latnivalo_id_fkey` FOREIGN KEY (`latnivalo_id`) REFERENCES `Latnivalo`(`latnivalo_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Foglalas` ADD CONSTRAINT `Foglalas_utazas_id_fkey` FOREIGN KEY (`utazas_id`) REFERENCES `Utazas`(`utazas_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EllenorzoLista` ADD CONSTRAINT `EllenorzoLista_utazas_id_fkey` FOREIGN KEY (`utazas_id`) REFERENCES `Utazas`(`utazas_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListaElem` ADD CONSTRAINT `ListaElem_lista_id_fkey` FOREIGN KEY (`lista_id`) REFERENCES `EllenorzoLista`(`lista_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
