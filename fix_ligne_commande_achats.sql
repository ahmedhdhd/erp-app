-- Script to add missing columns to LigneCommandeAchats table
-- Adding PrixUnitaireHT, PrixUnitaireTTC, and TauxTVA columns

-- Add PrixUnitaireHT column
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireHT'
)
BEGIN
    ALTER TABLE LigneCommandeAchats ADD PrixUnitaireHT DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixUnitaireHT column to LigneCommandeAchats table';
END

-- Add PrixUnitaireTTC column
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireTTC'
)
BEGIN
    ALTER TABLE LigneCommandeAchats ADD PrixUnitaireTTC DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixUnitaireTTC column to LigneCommandeAchats table';
END

-- Add TauxTVA column
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'TauxTVA'
)
BEGIN
    ALTER TABLE LigneCommandeAchats ADD TauxTVA DECIMAL(5,2) NOT NULL DEFAULT 20.00;
    PRINT 'Added TauxTVA column to LigneCommandeAchats table';
END

-- Wait for a moment to ensure columns are created
WAITFOR DELAY '00:00:01';

-- Update existing records to populate the new columns
-- Use a separate check to ensure columns exist before updating
IF EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireHT'
)
BEGIN
    EXEC('
    UPDATE LigneCommandeAchats 
    SET 
        PrixUnitaireHT = ISNULL(PrixUnitaire, 0),
        PrixUnitaireTTC = ISNULL(PrixUnitaire, 0) * (1 + ISNULL(TauxTVA, 20.00) / 100),
        TauxTVA = ISNULL(TauxTVA, 20.00)
    WHERE 
        PrixUnitaireHT = 0 AND 
        PrixUnitaireTTC = 0;
    
    PRINT ''Updated existing records in LigneCommandeAchats table'';');
END

-- Create a trigger to automatically calculate TTC values
IF OBJECT_ID('trg_UpdateLigneCommandeAchatsTTC', 'TR') IS NOT NULL
    DROP TRIGGER trg_UpdateLigneCommandeAchatsTTC;
GO

-- Check if all required columns exist before creating trigger
IF EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireHT'
)
AND EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireTTC'
)
AND EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'TauxTVA'
)
BEGIN
    CREATE TRIGGER trg_UpdateLigneCommandeAchatsTTC
    ON LigneCommandeAchats
    AFTER INSERT, UPDATE
    AS
    BEGIN
        -- Update TTC values based on HT values and VAT rate
        UPDATE lca
        SET 
            lca.PrixUnitaireTTC = i.PrixUnitaireHT * (1 + i.TauxTVA / 100)
        FROM LigneCommandeAchats lca
        INNER JOIN inserted i ON lca.Id = i.Id
        WHERE 
            i.PrixUnitaireHT IS NOT NULL AND 
            i.TauxTVA IS NOT NULL;
    END
    PRINT 'Created trigger to automatically calculate TTC values for LigneCommandeAchats';
END
GO