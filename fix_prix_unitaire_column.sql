-- Script to fix the PrixUnitaire column issue in LigneCommandeAchats table

-- First, check if the PrixUnitaire column exists and its properties
IF EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'LigneCommandeAchats' 
    AND COLUMN_NAME = 'PrixUnitaire'
)
BEGIN
    PRINT 'PrixUnitaire column exists. Checking if it allows NULL values.';
    
    -- Check if the column allows NULL values
    IF COL_LENGTH('LigneCommandeAchats', 'PrixUnitaire') IS NOT NULL
    BEGIN
        -- Check if column is nullable
        DECLARE @IsNullable VARCHAR(3) = (
            SELECT IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'LigneCommandeAchats' 
            AND COLUMN_NAME = 'PrixUnitaire'
        );
        
        IF @IsNullable = 'NO'
        BEGIN
            PRINT 'PrixUnitaire column does not allow NULL. Altering column to allow NULL values.';
            -- Alter the column to allow NULL values
            ALTER TABLE LigneCommandeAchats ALTER COLUMN PrixUnitaire DECIMAL(18,2) NULL;
            PRINT 'PrixUnitaire column altered to allow NULL values.';
        END
        ELSE
        BEGIN
            PRINT 'PrixUnitaire column already allows NULL values.';
        END
    END
END
ELSE
BEGIN
    PRINT 'PrixUnitaire column does not exist.';
END

-- Update existing records to ensure PrixUnitaire is set based on PrixUnitaireHT
UPDATE LigneCommandeAchats 
SET PrixUnitaire = ISNULL(PrixUnitaireHT, 0)
WHERE PrixUnitaire IS NULL;

PRINT 'Updated existing records to ensure PrixUnitaire has values.';