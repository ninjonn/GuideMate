-- Utazas letrehozasi datum hozzaadasa alapertelmezett idovel.
ALTER TABLE `Utazas`
ADD COLUMN `letrehozva` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
