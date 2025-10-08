# Fix Summary for LigneCommandeAchats Table Issues

## Issues Identified

1. **Database Schema Mismatch**: The database had a `PrixUnitaire` column that was NOT NULL, but the application was trying to insert NULL values.
2. **Missing Columns**: The database was missing `PrixUnitaireHT`, `PrixUnitaireTTC`, and `TauxTVA` columns that the application expected.
3. **Model Mismatch**: The entity model didn't match the database schema.

## Fixes Applied

### 1. Database Schema Updates

Created SQL script `complete_fix_ligne_commande_achats.sql` that:
- Made the existing `PrixUnitaire` column nullable
- Added missing columns: `PrixUnitaireHT`, `PrixUnitaireTTC`, and `TauxTVA`
- Updated existing records with appropriate values
- Created a trigger to automatically calculate TTC values

### 2. Model Updates

Updated `Models\LigneCommandeAchat.cs` to include the `PrixUnitaire` property:
```csharp
public decimal? PrixUnitaire { get; set; } // Made nullable to match database
```

### 3. Service Layer Updates

Updated `Services\CommandeAchatService.cs` to properly set the `PrixUnitaire` property when creating new entities:
```csharp
var ligne = new LigneCommandeAchat
{
    ProduitId = ligneRequest.ProduitId,
    Quantite = ligneRequest.Quantite,
    PrixUnitaire = ligneRequest.PrixUnitaireHT, // Set the PrixUnitaire to match PrixUnitaireHT
    PrixUnitaireHT = ligneRequest.PrixUnitaireHT,
    TauxTVA = ligneRequest.TauxTVA,
    PrixUnitaireTTC = ligneRequest.PrixUnitaireTTC,
    TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaireHT
};
```

## Files Created

1. `fix_ligne_commande_achats.sql` - Initial attempt to fix the issue
2. `fix_ligne_commande_achats_v2.sql` - Simplified column addition script
3. `update_ligne_commande_achats_data.sql` - Data update script
4. `fix_prix_unitaire_column.sql` - Script to fix the PrixUnitaire column nullability
5. `complete_fix_ligne_commande_achats.sql` - Complete solution script

## Instructions

1. Run the `complete_fix_ligne_commande_achats.sql` script in SQL Server Management Studio
2. Deploy the updated application code
3. Test creating a new purchase order to verify the fix