using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class AddMissingColumnsManual : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Email column to Employes table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Email')
                BEGIN
                    ALTER TABLE Employes ADD Email nvarchar(100) NOT NULL DEFAULT ''
                    PRINT 'Added Email column to Employes table'
                END");

            // Add Telephone column to Employes table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Telephone')
                BEGIN
                    ALTER TABLE Employes ADD Telephone nvarchar(20) NOT NULL DEFAULT ''
                    PRINT 'Added Telephone column to Employes table'
                END");

            // Add TauxTVA column to Produits table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'Produits' AND COLUMN_NAME = 'TauxTVA')
                BEGIN
                    ALTER TABLE Produits ADD TauxTVA decimal(5,2) NOT NULL DEFAULT 19.00
                    PRINT 'Added TauxTVA column to Produits table'
                END");

            // Add CreePar column to MouvementStocks table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'MouvementStocks' AND COLUMN_NAME = 'CreePar')
                BEGIN
                    ALTER TABLE MouvementStocks ADD CreePar nvarchar(100) NOT NULL DEFAULT ''
                    PRINT 'Added CreePar column to MouvementStocks table'
                END");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Email')
                BEGIN
                    ALTER TABLE Employes DROP COLUMN Email
                END");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'Employes' AND COLUMN_NAME = 'Telephone')
                BEGIN
                    ALTER TABLE Employes DROP COLUMN Telephone
                END");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'Produits' AND COLUMN_NAME = 'TauxTVA')
                BEGIN
                    ALTER TABLE Produits DROP COLUMN TauxTVA
                END");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE TABLE_NAME = 'MouvementStocks' AND COLUMN_NAME = 'CreePar')
                BEGIN
                    ALTER TABLE MouvementStocks DROP COLUMN CreePar
                END");
        }
    }
}