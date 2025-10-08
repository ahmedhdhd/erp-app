-- Script to update product price columns in the database
-- This script ensures all price columns exist and have proper defaults

-- Check if columns exist and add them if they don't
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Produits' 
    AND COLUMN_NAME = 'PrixAchatHT'
)
BEGIN
    ALTER TABLE Produits ADD PrixAchatHT DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixAchatHT column to Produits table';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Produits' 
    AND COLUMN_NAME = 'PrixVenteHT'
)
BEGIN
    ALTER TABLE Produits ADD PrixVenteHT DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixVenteHT column to Produits table';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Produits' 
    AND COLUMN_NAME = 'PrixVenteMinHT'
)
BEGIN
    ALTER TABLE Produits ADD PrixVenteMinHT DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixVenteMinHT column to Produits table';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Produits' 
    AND COLUMN_NAME = 'PrixAchatTTC'
)
BEGIN
    ALTER TABLE Produits ADD PrixAchatTTC DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixAchatTTC column to Produits table';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Produits' 
    AND COLUMN_NAME = 'PrixVenteTTC'
)
BEGIN
    ALTER TABLE Produits ADD PrixVenteTTC DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixVenteTTC column to Produits table';
END

IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Produits' 
    AND COLUMN_NAME = 'PrixVenteMinTTC'
)
BEGIN
    ALTER TABLE Produits ADD PrixVenteMinTTC DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PrixVenteMinTTC column to Produits table';
END

-- Update existing records to ensure HT values match base price values
-- This ensures backward compatibility for existing products
UPDATE Produits 
SET 
    PrixAchatHT = PrixAchat,
    PrixVenteHT = PrixVente,
    PrixVenteMinHT = PrixVenteMin,
    PrixAchatTTC = PrixAchat * (1 + TauxTVA / 100),
    PrixVenteTTC = PrixVente * (1 + TauxTVA / 100),
    PrixVenteMinTTC = PrixVenteMin * (1 + TauxTVA / 100)
WHERE 
    PrixAchatHT = 0 AND 
    PrixVenteHT = 0 AND 
    PrixVenteMinHT = 0;

PRINT 'Updated existing product records with HT and TTC values';

-- Add a trigger to automatically calculate TTC values when HT values or VAT rate changes
IF OBJECT_ID('trg_UpdateProductTTC', 'TR') IS NOT NULL
    DROP TRIGGER trg_UpdateProductTTC;
GO

CREATE TRIGGER trg_UpdateProductTTC
ON Produits
AFTER INSERT, UPDATE
AS
BEGIN
    -- Update TTC values based on HT values and VAT rate
    UPDATE p
    SET 
        p.PrixAchatTTC = i.PrixAchatHT * (1 + i.TauxTVA / 100),
        p.PrixVenteTTC = i.PrixVenteHT * (1 + i.TauxTVA / 100),
        p.PrixVenteMinTTC = i.PrixVenteMinHT * (1 + i.TauxTVA / 100)
    FROM Produits p
    INNER JOIN inserted i ON p.Id = i.Id
    WHERE 
        i.PrixAchatHT IS NOT NULL AND 
        i.PrixVenteHT IS NOT NULL AND 
        i.PrixVenteMinHT IS NOT NULL AND
        i.TauxTVA IS NOT NULL;
END
GO

PRINT 'Created trigger to automatically calculate TTC values';

-- Create indexes for better performance on price columns
IF NOT EXISTS (
    SELECT * 
    FROM sys.indexes 
    WHERE name = 'IX_Produits_PrixVente' 
    AND object_id = OBJECT_ID('Produits')
)
BEGIN
    CREATE INDEX IX_Produits_PrixVente ON Produits (PrixVente);
    PRINT 'Created index on PrixVente column';
END

IF NOT EXISTS (
    SELECT * 
    FROM sys.indexes 
    WHERE name = 'IX_Produits_PrixAchat' 
    AND object_id = OBJECT_ID('Produits')
)
BEGIN
    CREATE INDEX IX_Produits_PrixAchat ON Produits (PrixAchat);
    PRINT 'Created index on PrixAchat column';
END

PRINT 'Database update completed successfully';