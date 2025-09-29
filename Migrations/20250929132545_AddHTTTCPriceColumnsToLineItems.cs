using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class AddHTTTCPriceColumnsToLineItems : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new columns without renaming existing PrixUnitaire column
            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireHT",
                table: "LigneFactureVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireTTC",
                table: "LigneFactureVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TauxTVA",
                table: "LigneFactureVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireHT",
                table: "LigneFactureAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireTTC",
                table: "LigneFactureAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TauxTVA",
                table: "LigneFactureAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireHT",
                table: "LigneDevis",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireTTC",
                table: "LigneDevis",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TauxTVA",
                table: "LigneDevis",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireHT",
                table: "LigneCommandeVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireTTC",
                table: "LigneCommandeVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TauxTVA",
                table: "LigneCommandeVentes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireHT",
                table: "LigneCommandeAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireTTC",
                table: "LigneCommandeAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TauxTVA",
                table: "LigneCommandeAchats",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrixUnitaireHT",
                table: "LigneFactureVentes");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireTTC",
                table: "LigneFactureVentes");

            migrationBuilder.DropColumn(
                name: "TauxTVA",
                table: "LigneFactureVentes");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireHT",
                table: "LigneFactureAchats");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireTTC",
                table: "LigneFactureAchats");

            migrationBuilder.DropColumn(
                name: "TauxTVA",
                table: "LigneFactureAchats");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireHT",
                table: "LigneDevis");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireTTC",
                table: "LigneDevis");

            migrationBuilder.DropColumn(
                name: "TauxTVA",
                table: "LigneDevis");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireHT",
                table: "LigneCommandeVentes");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireTTC",
                table: "LigneCommandeVentes");

            migrationBuilder.DropColumn(
                name: "TauxTVA",
                table: "LigneCommandeVentes");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireHT",
                table: "LigneCommandeAchats");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireTTC",
                table: "LigneCommandeAchats");

            migrationBuilder.DropColumn(
                name: "TauxTVA",
                table: "LigneCommandeAchats");
        }
    }
}