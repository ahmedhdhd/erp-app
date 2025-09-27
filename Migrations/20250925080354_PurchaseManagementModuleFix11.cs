using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class PurchaseManagementModuleFix11 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ModePaiement",
                table: "PaiementFournisseurs",
                newName: "Statut");

            migrationBuilder.RenameColumn(
                name: "ModePaiement",
                table: "PaiementClients",
                newName: "Statut");

            migrationBuilder.RenameColumn(
                name: "Quantite",
                table: "LigneReceptions",
                newName: "QuantiteRejetee");

            migrationBuilder.RenameColumn(
                name: "Quantite",
                table: "LigneFactureAchats",
                newName: "QuantiteFacturee");

            migrationBuilder.RenameColumn(
                name: "ProduitId",
                table: "LigneFactureAchats",
                newName: "LigneCommandeId");

            migrationBuilder.AddColumn<string>(
                name: "MethodePaiement",
                table: "PaiementFournisseurs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MethodePaiement",
                table: "PaiementClients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Handle LigneCommandeId column - it might already exist
            migrationBuilder.Sql(@"
                -- Check if LigneCommandeId column exists
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'LigneCommandeId')
                BEGIN
                    -- Check if the column is NOT NULL
                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'LigneCommandeId' AND IS_NULLABLE = 'NO')
                    BEGIN
                        -- First, try to update existing values to 0 for invalid references
                        UPDATE LigneReceptions 
                        SET LigneCommandeId = 0 
                        WHERE LigneCommandeId NOT IN (SELECT Id FROM LigneCommandeAchats WHERE Id IS NOT NULL) OR LigneCommandeId IS NULL
                        
                        -- Then alter the column to allow NULL values
                        ALTER TABLE LigneReceptions ALTER COLUMN LigneCommandeId int NULL
                    END
                    ELSE
                    BEGIN
                        -- Column already allows NULL, just update invalid values
                        UPDATE LigneReceptions 
                        SET LigneCommandeId = NULL 
                        WHERE LigneCommandeId NOT IN (SELECT Id FROM LigneCommandeAchats WHERE Id IS NOT NULL)
                    END
                END
                ELSE
                BEGIN
                    -- Column doesn't exist, add it as NULLable
                    ALTER TABLE LigneReceptions ADD LigneCommandeId int NULL
                END");

            // Check if MotifRejet column exists before adding it
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'MotifRejet')
                BEGIN
                    ALTER TABLE LigneReceptions ADD MotifRejet nvarchar(max) NOT NULL DEFAULT N''
                END");

            // Check if QuantiteRecue column exists before adding it
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'QuantiteRecue')
                BEGIN
                    ALTER TABLE LigneReceptions ADD QuantiteRecue int NOT NULL DEFAULT 0
                END");

            // Check if Email column exists before adding it to Employes table
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Email')
                BEGIN
                    ALTER TABLE Employes ADD Email nvarchar(max) NOT NULL DEFAULT N''
                END");

            // Check if Telephone column exists before adding it to Employes table
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Telephone')
                BEGIN
                    ALTER TABLE Employes ADD Telephone nvarchar(max) NOT NULL DEFAULT N''
                END");

            migrationBuilder.CreateIndex(
                name: "IX_LigneReceptions_LigneCommandeId",
                table: "LigneReceptions",
                column: "LigneCommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneFactureAchats_LigneCommandeId",
                table: "LigneFactureAchats",
                column: "LigneCommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneDemandeAchats_ProduitId",
                table: "LigneDemandeAchats",
                column: "ProduitId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneCommandeAchats_ProduitId",
                table: "LigneCommandeAchats",
                column: "ProduitId");

            migrationBuilder.AddForeignKey(
                name: "FK_LigneCommandeAchats_Produits_ProduitId",
                table: "LigneCommandeAchats",
                column: "ProduitId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneDemandeAchats_Produits_ProduitId",
                table: "LigneDemandeAchats",
                column: "ProduitId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneFactureAchats_LigneCommandeAchats_LigneCommandeId",
                table: "LigneFactureAchats",
                column: "LigneCommandeId",
                principalTable: "LigneCommandeAchats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Add the foreign key constraint for LigneReceptions after updating existing data
            migrationBuilder.Sql(@"
                -- Update existing LigneCommandeId values to NULL for records that don't exist in LigneCommandeAchats
                UPDATE LigneReceptions 
                SET LigneCommandeId = NULL 
                WHERE LigneCommandeId NOT IN (SELECT Id FROM LigneCommandeAchats WHERE Id IS NOT NULL)
                
                -- Add the foreign key constraint
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                               WHERE TABLE_NAME = 'LigneReceptions' AND CONSTRAINT_NAME = 'FK_LigneReceptions_LigneCommandeAchats_LigneCommandeId')
                BEGIN
                    ALTER TABLE LigneReceptions ADD CONSTRAINT [FK_LigneReceptions_LigneCommandeAchats_LigneCommandeId] 
                    FOREIGN KEY ([LigneCommandeId]) REFERENCES [LigneCommandeAchats] ([Id]) ON DELETE NO ACTION
                END");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LigneCommandeAchats_Produits_ProduitId",
                table: "LigneCommandeAchats");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneDemandeAchats_Produits_ProduitId",
                table: "LigneDemandeAchats");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneFactureAchats_LigneCommandeAchats_LigneCommandeId",
                table: "LigneFactureAchats");

            // Drop the foreign key constraint for LigneReceptions
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                           WHERE TABLE_NAME = 'LigneReceptions' AND CONSTRAINT_NAME = 'FK_LigneReceptions_LigneCommandeAchats_LigneCommandeId')
                BEGIN
                    ALTER TABLE LigneReceptions DROP CONSTRAINT [FK_LigneReceptions_LigneCommandeAchats_LigneCommandeId]
                END");

            migrationBuilder.DropIndex(
                name: "IX_LigneReceptions_LigneCommandeId",
                table: "LigneReceptions");

            migrationBuilder.DropIndex(
                name: "IX_LigneFactureAchats_LigneCommandeId",
                table: "LigneFactureAchats");

            migrationBuilder.DropIndex(
                name: "IX_LigneDemandeAchats_ProduitId",
                table: "LigneDemandeAchats");

            migrationBuilder.DropIndex(
                name: "IX_LigneCommandeAchats_ProduitId",
                table: "LigneCommandeAchats");

            migrationBuilder.DropColumn(
                name: "MethodePaiement",
                table: "PaiementFournisseurs");

            migrationBuilder.DropColumn(
                name: "MethodePaiement",
                table: "PaiementClients");

            // Check if LigneCommandeId column exists before dropping it
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'LigneCommandeId')
                BEGIN
                    ALTER TABLE LigneReceptions DROP COLUMN LigneCommandeId
                END");

            // Check if MotifRejet column exists before dropping it
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'MotifRejet')
                BEGIN
                    ALTER TABLE LigneReceptions DROP COLUMN MotifRejet
                END");

            // Check if QuantiteRecue column exists before dropping it
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'LigneReceptions' AND COLUMN_NAME = 'QuantiteRecue')
                BEGIN
                    ALTER TABLE LigneReceptions DROP COLUMN QuantiteRecue
                END");

            // Check if Email column exists before dropping it from Employes table
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Email')
                BEGIN
                    ALTER TABLE Employes DROP COLUMN Email
                END");

            // Check if Telephone column exists before dropping it from Employes table
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Telephone')
                BEGIN
                    ALTER TABLE Employes DROP COLUMN Telephone
                END");

            migrationBuilder.RenameColumn(
                name: "Statut",
                table: "PaiementFournisseurs",
                newName: "ModePaiement");

            migrationBuilder.RenameColumn(
                name: "Statut",
                table: "PaiementClients",
                newName: "ModePaiement");

            migrationBuilder.RenameColumn(
                name: "QuantiteRejetee",
                table: "LigneReceptions",
                newName: "Quantite");

            migrationBuilder.RenameColumn(
                name: "QuantiteFacturee",
                table: "LigneFactureAchats",
                newName: "Quantite");

            migrationBuilder.RenameColumn(
                name: "LigneCommandeId",
                table: "LigneFactureAchats",
                newName: "ProduitId");
        }
    }
}