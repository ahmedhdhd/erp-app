-- Complete script to fix LigneCommandeAchats table structure

-- First, check if PrixUnitaire column exists, and if so, make it nullable
IF EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaire'
)
BEGIN
    -- Check if the column is currently NOT NULL
    IF (SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'LigneCommandeAchats' AND COLUMN_NAME = 'PrixUnitaire') = 'NO'
    BEGIN
        ALTER TABLE LigneCommandeAchats ALTER COLUMN PrixUnitaire DECIMAL(18,2) NULL;
        PRINT 'Made PrixUnitaire column nullable';
    END
    ELSE
    BEGIN
        PRINT 'PrixUnitaire column is already nullable';
    END
END
ELSE
BEGIN
    -- Add the PrixUnitaire column if it doesn't exist
    ALTER TABLE LigneCommandeAchats ADD PrixUnitaire DECIMAL(18,2) NULL;
    PRINT 'Added PrixUnitaire column';
END

-- Add the missing columns if they don't exist
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireHT'
)
BEGIN
    ALTER TABLE LigneCommandeAchats ADD PrixUnitaireHT DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixUnitaireHT column';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaireTTC'
)
BEGIN
    ALTER TABLE LigneCommandeAchats ADD PrixUnitaireTTC DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixUnitaireTTC column';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'TauxTVA'
)
BEGIN
    ALTER TABLE LigneCommandeAchats ADD TauxTVA DECIMAL(5,2) NOT NULL DEFAULT 20.00;
    PRINT 'Added TauxTVA column';
END

-- Update existing records to populate the new columns
-- Set PrixUnitaireHT to PrixUnitaire if PrixUnitaire is not null, otherwise 0
UPDATE LigneCommandeAchats 
SET 
    PrixUnitaireHT = ISNULL(PrixUnitaire, 0),
    TauxTVA = 20.00,
    PrixUnitaireTTC = ISNULL(PrixUnitaire, 0) * (1 + 20.00 / 100);

PRINT 'Updated existing records with HT, TTC and VAT values';

-- Create a trigger to automatically calculate TTC values
IF OBJECT_ID('trg_UpdateLigneCommandeAchatsTTC', 'TR') IS NOT NULL
    DROP TRIGGER trg_UpdateLigneCommandeAchatsTTC;
GO

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
GO

PRINT 'Created trigger to automatically calculate TTC values';