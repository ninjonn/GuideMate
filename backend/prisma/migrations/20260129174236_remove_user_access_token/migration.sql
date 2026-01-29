/*
  Warnings:

  - You are about to drop the `UserAccessToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserAccessToken` DROP FOREIGN KEY `UserAccessToken_felhasznalo_id_fkey`;

-- DropTable
DROP TABLE `UserAccessToken`;
