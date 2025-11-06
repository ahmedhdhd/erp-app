using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    /// <inheritdoc />
    public partial class AddSalaryFieldsToSituationFamiliale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Prime",
                table: "Employes");

            migrationBuilder.DropColumn(
                name: "SalaireBase",
                table: "Employes");

            migrationBuilder.AddColumn<decimal>(
                name: "PrimePresence",
                table: "SituationsFamiliales",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrimeProduction",
                table: "SituationsFamiliales",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SalaireBase",
                table: "SituationsFamiliales",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrimePresence",
                table: "SituationsFamiliales");

            migrationBuilder.DropColumn(
                name: "PrimeProduction",
                table: "SituationsFamiliales");

            migrationBuilder.DropColumn(
                name: "SalaireBase",
                table: "SituationsFamiliales");

            migrationBuilder.AddColumn<decimal>(
                name: "Prime",
                table: "Employes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SalaireBase",
                table: "Employes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
