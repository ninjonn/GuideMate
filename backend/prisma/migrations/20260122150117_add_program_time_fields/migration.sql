-- Add felhasznalo_id to Foglalas.
ALTER TABLE `Foglalas` ADD COLUMN `felhasznalo_id` INTEGER NULL;

-- Add time fields and optional description to Program, and make nap_datum required.
ALTER TABLE `Program`
  ADD COLUMN `leiras` VARCHAR(191) NULL,
  ADD COLUMN `kezdo_ido` VARCHAR(5) NOT NULL DEFAULT '00:00',
  ADD COLUMN `veg_ido` VARCHAR(5) NOT NULL DEFAULT '00:00',
  MODIFY `nap_datum` DATETIME(3) NOT NULL;

-- Drop defaults so new rows must provide times.
ALTER TABLE `Program`
  ALTER COLUMN `kezdo_ido` DROP DEFAULT,
  ALTER COLUMN `veg_ido` DROP DEFAULT;

-- Ensure utazas letrehozva default is set.
ALTER TABLE `Utazas` MODIFY `letrehozva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Add foreign key for foglalas owner.
ALTER TABLE `Foglalas`
  ADD CONSTRAINT `Foglalas_felhasznalo_id_fkey`
  FOREIGN KEY (`felhasznalo_id`) REFERENCES `Felhasznalo`(`felhasznalo_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
