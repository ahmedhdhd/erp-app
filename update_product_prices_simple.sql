-- Simple script to update product price data in the database
-- This script updates existing records to ensure price values are properly set

-- Update existing records to ensure price values are not zero
-- This helps with products that may have been created with default zero values
UPDATE Produits 
SET 
    PrixAchat = CASE WHEN PrixAchat = 0 AND PrixAchatHT > 0 THEN PrixAchatHT ELSE PrixAchat END,
    PrixVente = CASE WHEN PrixVente = 0 AND PrixVenteHT > 0 THEN PrixVenteHT ELSE PrixVente END,
    PrixVenteMin = CASE WHEN PrixVenteMin = 0 AND PrixVenteMinHT > 0 THEN PrixVenteMinHT ELSE PrixVenteMin END
WHERE 
    (PrixAchat = 0 OR PrixVente = 0 OR PrixVenteMin = 0) AND
    (PrixAchatHT > 0 OR PrixVenteHT > 0 OR PrixVenteMinHT > 0);

-- Update TTC values based on HT values and VAT rate for all products
UPDATE Produits 
SET 
    PrixAchatTTC = PrixAchat * (1 + TauxTVA / 100),
    PrixVenteTTC = PrixVente * (1 + TauxTVA / 100),
    PrixVenteMinTTC = PrixVenteMin * (1 + TauxTVA / 100);

-- Ensure HT values match base price values for consistency
UPDATE Produits 
SET 
    PrixAchatHT = PrixAchat,
    PrixVenteHT = PrixVente,
    PrixVenteMinHT = PrixVenteMin;

PRINT 'Product price data updated successfully';