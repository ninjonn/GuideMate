-- Drop ProgramLatnivalo junction table first (has foreign keys to both)
DROP TABLE IF EXISTS `ProgramLatnivalo`;

-- Drop Latnivalo (has foreign key to Helyszin)
DROP TABLE IF EXISTS `Latnivalo`;

-- Drop Helyszin
DROP TABLE IF EXISTS `Helyszin`;

-- Remove latnivalok relation field from Program (already handled by dropping ProgramLatnivalo)
