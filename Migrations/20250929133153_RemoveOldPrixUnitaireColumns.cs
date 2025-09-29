using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class RemoveOldPrixUnitaireColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove the old PrixUnitaire columns as they're no longer needed
            migrationBuilder.DropColumn(
                name: "PrixUnitaire",
                table: "LigneFactureVentes");

            migrationBuilder.DropColumn(
                name: "PrixUnitaire",
                table: "LigneFactureAchats");

            migrationBuilder.DropColumn(
                name: "PrixUnitaire",
                table: "LigneDevis");

            migrationBuilder.DropColumn(
                name: "PrixUnitaire",
                table: "LigneCommandeVentes");

            migrationBuilder.DropColumn(
                name: "PrixUnitaire",
                table: "LigneCommandeAchats");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // In the down migration, we add the columns back
            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaire",
                table: "LigneFactureVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaire",
                table: "LigneFactureAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaire",
                table: "LigneDevis",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaire",
                table: "LigneCommandeVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaire",
                table: "LigneCommandeAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}