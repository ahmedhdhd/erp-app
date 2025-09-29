using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class FixTauxTVAConfiguration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if the column exists before adding it
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Produits' 
                    AND COLUMN_NAME = 'TauxTVA'
                )
                BEGIN
                    ALTER TABLE Produits ADD TauxTVA decimal(18,2) NOT NULL DEFAULT 0
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Check if the column exists before dropping it
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT * 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Produits' 
                    AND COLUMN_NAME = 'TauxTVA'
                )
                BEGIN
                    ALTER TABLE Produits DROP COLUMN TauxTVA
                END
            ");
        }
    }
}