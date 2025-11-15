using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActiviteEmployes_Employes_EmployeId",
                table: "ActiviteEmployes");

            migrationBuilder.DropForeignKey(
                name: "FK_AnalyseClients_Clients_ClientId",
                table: "AnalyseClients");

            migrationBuilder.DropForeignKey(
                name: "FK_DemandeAchats_Employes_EmployeId",
                table: "DemandeAchats");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneDemandeAchats_DemandeAchats_DemandeId",
                table: "LigneDemandeAchats");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneDemandeAchats_Produits_ProduitId",
                table: "LigneDemandeAchats");

            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceFournisseurs_Fournisseurs_FournisseurId",
                table: "PerformanceFournisseurs");

            migrationBuilder.DropForeignKey(
                name: "FK_TransactionClients_Clients_ClientId",
                table: "TransactionClients");

            migrationBuilder.DropForeignKey(
                name: "FK_TransactionFournisseurs_Fournisseurs_FournisseurId",
                table: "TransactionFournisseurs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TransactionFournisseurs",
                table: "TransactionFournisseurs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TransactionClients",
                table: "TransactionClients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PerformanceFournisseurs",
                table: "PerformanceFournisseurs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LigneDemandeAchats",
                table: "LigneDemandeAchats");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DemandeAchats",
                table: "DemandeAchats");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AnalyseClients",
                table: "AnalyseClients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ActiviteEmployes",
                table: "ActiviteEmployes");

            migrationBuilder.RenameTable(
                name: "TransactionFournisseurs",
                newName: "TransactionFournisseur");

            migrationBuilder.RenameTable(
                name: "TransactionClients",
                newName: "TransactionClient");

            migrationBuilder.RenameTable(
                name: "PerformanceFournisseurs",
                newName: "PerformancesFournisseurs");

            migrationBuilder.RenameTable(
                name: "LigneDemandeAchats",
                newName: "LigneDemandesAchat");

            migrationBuilder.RenameTable(
                name: "DemandeAchats",
                newName: "DemandesAchat");

            migrationBuilder.RenameTable(
                name: "AnalyseClients",
                newName: "AnalysesClients");

            migrationBuilder.RenameTable(
                name: "ActiviteEmployes",
                newName: "ActivitesEmployes");

            migrationBuilder.RenameIndex(
                name: "IX_TransactionFournisseurs_FournisseurId",
                table: "TransactionFournisseur",
                newName: "IX_TransactionFournisseur_FournisseurId");

            migrationBuilder.RenameIndex(
                name: "IX_TransactionClients_ClientId",
                table: "TransactionClient",
                newName: "IX_TransactionClient_ClientId");

            migrationBuilder.RenameIndex(
                name: "IX_PerformanceFournisseurs_FournisseurId",
                table: "PerformancesFournisseurs",
                newName: "IX_PerformancesFournisseurs_FournisseurId");

            migrationBuilder.RenameIndex(
                name: "IX_LigneDemandeAchats_ProduitId",
                table: "LigneDemandesAchat",
                newName: "IX_LigneDemandesAchat_ProduitId");

            migrationBuilder.RenameIndex(
                name: "IX_LigneDemandeAchats_DemandeId",
                table: "LigneDemandesAchat",
                newName: "IX_LigneDemandesAchat_DemandeId");

            migrationBuilder.RenameIndex(
                name: "IX_DemandeAchats_EmployeId",
                table: "DemandesAchat",
                newName: "IX_DemandesAchat_EmployeId");

            migrationBuilder.RenameIndex(
                name: "IX_AnalyseClients_ClientId",
                table: "AnalysesClients",
                newName: "IX_AnalysesClients_ClientId");

            migrationBuilder.RenameIndex(
                name: "IX_ActiviteEmployes_EmployeId",
                table: "ActivitesEmployes",
                newName: "IX_ActivitesEmployes_EmployeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TransactionFournisseur",
                table: "TransactionFournisseur",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TransactionClient",
                table: "TransactionClient",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PerformancesFournisseurs",
                table: "PerformancesFournisseurs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LigneDemandesAchat",
                table: "LigneDemandesAchat",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DemandesAchat",
                table: "DemandesAchat",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AnalysesClients",
                table: "AnalysesClients",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ActivitesEmployes",
                table: "ActivitesEmployes",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "EtatsDePaie",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeId = table.Column<int>(type: "int", nullable: false),
                    Mois = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NombreDeJours = table.Column<int>(type: "int", nullable: false),
                    SalaireBase = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PrimePresence = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PrimeProduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalaireBrut = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CNSS = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalaireImposable = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IRPP = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CSS = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalaireNet = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EtatsDePaie", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EtatsDePaie_Employes_EmployeId",
                        column: x => x.EmployeId,
                        principalTable: "Employes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SituationsFamiliales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeId = table.Column<int>(type: "int", nullable: false),
                    EtatCivil = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChefDeFamille = table.Column<bool>(type: "bit", nullable: false),
                    NombreEnfants = table.Column<int>(type: "int", nullable: false),
                    EnfantsEtudiants = table.Column<int>(type: "int", nullable: false),
                    EnfantsHandicapes = table.Column<int>(type: "int", nullable: false),
                    ParentsACharge = table.Column<int>(type: "int", nullable: false),
                    ConjointACharge = table.Column<bool>(type: "bit", nullable: false),
                    DateDerniereMaj = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SituationsFamiliales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SituationsFamiliales_Employes_EmployeId",
                        column: x => x.EmployeId,
                        principalTable: "Employes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EtatsDePaie_EmployeId",
                table: "EtatsDePaie",
                column: "EmployeId");

            migrationBuilder.CreateIndex(
                name: "IX_SituationsFamiliales_EmployeId",
                table: "SituationsFamiliales",
                column: "EmployeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ActivitesEmployes_Employes_EmployeId",
                table: "ActivitesEmployes",
                column: "EmployeId",
                principalTable: "Employes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AnalysesClients_Clients_ClientId",
                table: "AnalysesClients",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DemandesAchat_Employes_EmployeId",
                table: "DemandesAchat",
                column: "EmployeId",
                principalTable: "Employes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneDemandesAchat_DemandesAchat_DemandeId",
                table: "LigneDemandesAchat",
                column: "DemandeId",
                principalTable: "DemandesAchat",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneDemandesAchat_Produits_ProduitId",
                table: "LigneDemandesAchat",
                column: "ProduitId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformancesFournisseurs_Fournisseurs_FournisseurId",
                table: "PerformancesFournisseurs",
                column: "FournisseurId",
                principalTable: "Fournisseurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionClient_Clients_ClientId",
                table: "TransactionClient",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionFournisseur_Fournisseurs_FournisseurId",
                table: "TransactionFournisseur",
                column: "FournisseurId",
                principalTable: "Fournisseurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivitesEmployes_Employes_EmployeId",
                table: "ActivitesEmployes");

            migrationBuilder.DropForeignKey(
                name: "FK_AnalysesClients_Clients_ClientId",
                table: "AnalysesClients");

            migrationBuilder.DropForeignKey(
                name: "FK_DemandesAchat_Employes_EmployeId",
                table: "DemandesAchat");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneDemandesAchat_DemandesAchat_DemandeId",
                table: "LigneDemandesAchat");

            migrationBuilder.DropForeignKey(
                name: "FK_LigneDemandesAchat_Produits_ProduitId",
                table: "LigneDemandesAchat");

            migrationBuilder.DropForeignKey(
                name: "FK_PerformancesFournisseurs_Fournisseurs_FournisseurId",
                table: "PerformancesFournisseurs");

            migrationBuilder.DropForeignKey(
                name: "FK_TransactionClient_Clients_ClientId",
                table: "TransactionClient");

            migrationBuilder.DropForeignKey(
                name: "FK_TransactionFournisseur_Fournisseurs_FournisseurId",
                table: "TransactionFournisseur");

            migrationBuilder.DropTable(
                name: "EtatsDePaie");

            migrationBuilder.DropTable(
                name: "SituationsFamiliales");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TransactionFournisseur",
                table: "TransactionFournisseur");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TransactionClient",
                table: "TransactionClient");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PerformancesFournisseurs",
                table: "PerformancesFournisseurs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LigneDemandesAchat",
                table: "LigneDemandesAchat");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DemandesAchat",
                table: "DemandesAchat");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AnalysesClients",
                table: "AnalysesClients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ActivitesEmployes",
                table: "ActivitesEmployes");

            migrationBuilder.RenameTable(
                name: "TransactionFournisseur",
                newName: "TransactionFournisseurs");

            migrationBuilder.RenameTable(
                name: "TransactionClient",
                newName: "TransactionClients");

            migrationBuilder.RenameTable(
                name: "PerformancesFournisseurs",
                newName: "PerformanceFournisseurs");

            migrationBuilder.RenameTable(
                name: "LigneDemandesAchat",
                newName: "LigneDemandeAchats");

            migrationBuilder.RenameTable(
                name: "DemandesAchat",
                newName: "DemandeAchats");

            migrationBuilder.RenameTable(
                name: "AnalysesClients",
                newName: "AnalyseClients");

            migrationBuilder.RenameTable(
                name: "ActivitesEmployes",
                newName: "ActiviteEmployes");

            migrationBuilder.RenameIndex(
                name: "IX_TransactionFournisseur_FournisseurId",
                table: "TransactionFournisseurs",
                newName: "IX_TransactionFournisseurs_FournisseurId");

            migrationBuilder.RenameIndex(
                name: "IX_TransactionClient_ClientId",
                table: "TransactionClients",
                newName: "IX_TransactionClients_ClientId");

            migrationBuilder.RenameIndex(
                name: "IX_PerformancesFournisseurs_FournisseurId",
                table: "PerformanceFournisseurs",
                newName: "IX_PerformanceFournisseurs_FournisseurId");

            migrationBuilder.RenameIndex(
                name: "IX_LigneDemandesAchat_ProduitId",
                table: "LigneDemandeAchats",
                newName: "IX_LigneDemandeAchats_ProduitId");

            migrationBuilder.RenameIndex(
                name: "IX_LigneDemandesAchat_DemandeId",
                table: "LigneDemandeAchats",
                newName: "IX_LigneDemandeAchats_DemandeId");

            migrationBuilder.RenameIndex(
                name: "IX_DemandesAchat_EmployeId",
                table: "DemandeAchats",
                newName: "IX_DemandeAchats_EmployeId");

            migrationBuilder.RenameIndex(
                name: "IX_AnalysesClients_ClientId",
                table: "AnalyseClients",
                newName: "IX_AnalyseClients_ClientId");

            migrationBuilder.RenameIndex(
                name: "IX_ActivitesEmployes_EmployeId",
                table: "ActiviteEmployes",
                newName: "IX_ActiviteEmployes_EmployeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TransactionFournisseurs",
                table: "TransactionFournisseurs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TransactionClients",
                table: "TransactionClients",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PerformanceFournisseurs",
                table: "PerformanceFournisseurs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LigneDemandeAchats",
                table: "LigneDemandeAchats",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DemandeAchats",
                table: "DemandeAchats",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AnalyseClients",
                table: "AnalyseClients",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ActiviteEmployes",
                table: "ActiviteEmployes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActiviteEmployes_Employes_EmployeId",
                table: "ActiviteEmployes",
                column: "EmployeId",
                principalTable: "Employes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AnalyseClients_Clients_ClientId",
                table: "AnalyseClients",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DemandeAchats_Employes_EmployeId",
                table: "DemandeAchats",
                column: "EmployeId",
                principalTable: "Employes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneDemandeAchats_DemandeAchats_DemandeId",
                table: "LigneDemandeAchats",
                column: "DemandeId",
                principalTable: "DemandeAchats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LigneDemandeAchats_Produits_ProduitId",
                table: "LigneDemandeAchats",
                column: "ProduitId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceFournisseurs_Fournisseurs_FournisseurId",
                table: "PerformanceFournisseurs",
                column: "FournisseurId",
                principalTable: "Fournisseurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionClients_Clients_ClientId",
                table: "TransactionClients",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionFournisseurs_Fournisseurs_FournisseurId",
                table: "TransactionFournisseurs",
                column: "FournisseurId",
                principalTable: "Fournisseurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
