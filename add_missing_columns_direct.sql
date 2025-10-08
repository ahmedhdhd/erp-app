-- Add Email column to Employes table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Email')
BEGIN
    ALTER TABLE Employes ADD Email nvarchar(100) NOT NULL DEFAULT ''
    PRINT 'Added Email column to Employes table'
END
ELSE
BEGIN
    PRINT 'Email column already exists in Employes table'
END

-- Add Telephone column to Employes table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Telephone')
BEGIN
    ALTER TABLE Employes ADD Telephone nvarchar(20) NOT NULL DEFAULT ''
    PRINT 'Added Telephone column to Employes table'
END
ELSE
BEGIN
    PRINT 'Telephone column already exists in Employes table'
END

-- Add TauxTVA column to Produits table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Produits' AND COLUMN_NAME = 'TauxTVA')
BEGIN
    ALTER TABLE Produits ADD TauxTVA decimal(5,2) NOT NULL DEFAULT 19.00
    PRINT 'Added TauxTVA column to Produits table'
END
ELSE
BEGIN
    PRINT 'TauxTVA column already exists in Produits table'
END

-- Add CreePar column to MouvementStocks table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'MouvementStocks' AND COLUMN_NAME = 'CreePar')
BEGIN
    ALTER TABLE MouvementStocks ADD CreePar nvarchar(100) NOT NULL DEFAULT ''
    PRINT 'Added CreePar column to MouvementStocks table'
END
ELSE
BEGIN
    PRINT 'CreePar column already exists in MouvementStocks table'
END

-- Insert the migration record into __EFMigrationsHistory table
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20251008070610_AddMissingColumnsFinal')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20251008070610_AddMissingColumnsFinal', '6.0.4')
    PRINT 'Added migration record to __EFMigrationsHistory table'
END
ELSE
BEGIN
    PRINT 'Migration record already exists in __EFMigrationsHistory table'
END