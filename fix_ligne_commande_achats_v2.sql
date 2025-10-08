-- Script to add missing columns to LigneCommandeAchats table
-- Run this first part to add the columns

-- Add PrixUnitaireHT column
ALTER TABLE LigneCommandeAchats ADD PrixUnitaireHT DECIMAL(18,2) NOT NULL DEFAULT 0;
PRINT 'Added PrixUnitaireHT column to LigneCommandeAchats table';

-- Add PrixUnitaireTTC column
ALTER TABLE LigneCommandeAchats ADD PrixUnitaireTTC DECIMAL(18,2) NOT NULL DEFAULT 0;
PRINT 'Added PrixUnitaireTTC column to LigneCommandeAchats table';

-- Add TauxTVA column
ALTER TABLE LigneCommandeAchats ADD TauxTVA DECIMAL(5,2) NOT NULL DEFAULT 20.00;
PRINT 'Added TauxTVA column to LigneCommandeAchats table';