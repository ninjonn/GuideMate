-- Add letrehozva to Program
ALTER TABLE `Program` ADD COLUMN `letrehozva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Add letrehozva and szallas fields to Foglalas
ALTER TABLE `Foglalas`
  ADD COLUMN `letrehozva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `hely` VARCHAR(191) NULL,
  ADD COLUMN `cim` VARCHAR(191) NULL,
  ADD COLUMN `kezdo_datum` DATETIME(3) NULL,
  ADD COLUMN `veg_datum` DATETIME(3) NULL;
