using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class FixClientDevisRelationshipV2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommandeVentes_Clients_ClientId1",
                table: "CommandeVentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Devis_Clients_ClientId1",
                table: "Devis");

            migrationBuilder.DropIndex(
                name: "IX_Devis_ClientId1",
                table: "Devis");

            migrationBuilder.DropIndex(
                name: "IX_CommandeVentes_ClientId1",
                table: "CommandeVentes");

            migrationBuilder.DropColumn(
                name: "ClientId1",
                table: "Devis");

            migrationBuilder.DropColumn(
                name: "ClientId1",
                table: "CommandeVentes");

            migrationBuilder.CreateIndex(
                name: "IX_CommandeVentes_DevisId",
                table: "CommandeVentes",
                column: "DevisId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommandeVentes_Devis_DevisId",
                table: "CommandeVentes",
                column: "DevisId",
                principalTable: "Devis",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommandeVentes_Devis_DevisId",
                table: "CommandeVentes");

            migrationBuilder.DropIndex(
                name: "IX_CommandeVentes_DevisId",
                table: "CommandeVentes");

            migrationBuilder.AddColumn<int>(
                name: "ClientId1",
                table: "Devis",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ClientId1",
                table: "CommandeVentes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Devis_ClientId1",
                table: "Devis",
                column: "ClientId1");

            migrationBuilder.CreateIndex(
                name: "IX_CommandeVentes_ClientId1",
                table: "CommandeVentes",
                column: "ClientId1");

            migrationBuilder.AddForeignKey(
                name: "FK_CommandeVentes_Clients_ClientId1",
                table: "CommandeVentes",
                column: "ClientId1",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Devis_Clients_ClientId1",
                table: "Devis",
                column: "ClientId1",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
