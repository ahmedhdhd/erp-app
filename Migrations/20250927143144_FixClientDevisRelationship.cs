using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class FixClientDevisRelationship : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClientId1",
                table: "Devis",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "DevisId",
                table: "CommandeVentes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ClientId1",
                table: "CommandeVentes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "DemandeId",
                table: "CommandeAchats",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_LigneDevis_ProduitId",
                table: "LigneDevis",
                column: "ProduitId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneCommandeVentes_ProduitId",
                table: "LigneCommandeVentes",
                column: "ProduitId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_LigneCommandeVentes_Produits_ProduitId",
                table: "LigneCommandeVentes",
                column: "ProduitId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneDevis_Produits_ProduitId",
                table: "LigneDevis",
                column: "ProduitId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommandeVentes_Clients_ClientId1",
                table: "CommandeVentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Devis_Clients_ClientId1",
                table: "Devis");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneCommandeVentes_Produits_ProduitId",
                table: "LigneCommandeVentes");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneDevis_Produits_ProduitId",
                table: "LigneDevis");

            migrationBuilder.DropIndex(
                name: "IX_LigneDevis_ProduitId",
                table: "LigneDevis");

            migrationBuilder.DropIndex(
                name: "IX_LigneCommandeVentes_ProduitId",
                table: "LigneCommandeVentes");

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

            migrationBuilder.AlterColumn<int>(
                name: "DevisId",
                table: "CommandeVentes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DemandeId",
                table: "CommandeAchats",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
