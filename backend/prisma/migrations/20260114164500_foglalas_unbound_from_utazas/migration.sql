-- Remove utazas_id from Foglalas to make bookings independent of trips
ALTER TABLE `Foglalas` DROP FOREIGN KEY `Foglalas_utazas_id_fkey`;
ALTER TABLE `Foglalas` DROP COLUMN `utazas_id`;
