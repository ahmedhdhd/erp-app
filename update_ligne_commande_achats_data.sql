-- Script to update data in LigneCommandeAchats table after adding new columns

-- Update existing records to populate the new columns
UPDATE LigneCommandeAchats 
SET 
    PrixUnitaireHT = ISNULL(PrixUnitaire, 0),
    TauxTVA = 20.00,
    PrixUnitaireTTC = ISNULL(PrixUnitaire, 0) * (1 + 20.00 / 100);

PRINT 'Updated existing records in LigneCommandeAchats table with HT, TTC and VAT values';

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

PRINT 'Created trigger to automatically calculate TTC values for LigneCommandeAchats';