using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class PopulateHTTTCPriceColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Copy existing PrixUnitaire values to PrixUnitaireHT and calculate TTC values
            // For LigneDevis
            migrationBuilder.Sql(@"
                UPDATE LigneDevis 
                SET PrixUnitaireHT = PrixUnitaire,
                    TauxTVA = 20.0,
                    PrixUnitaireTTC = PrixUnitaire * 1.2
                WHERE PrixUnitaireHT = 0");

            // For LigneCommandeVentes
            migrationBuilder.Sql(@"
                UPDATE LigneCommandeVentes 
                SET PrixUnitaireHT = PrixUnitaire,
                    TauxTVA = 20.0,
                    PrixUnitaireTTC = PrixUnitaire * 1.2
                WHERE PrixUnitaireHT = 0");

            // For LigneCommandeAchats
            migrationBuilder.Sql(@"
                UPDATE LigneCommandeAchats 
                SET PrixUnitaireHT = PrixUnitaire,
                    TauxTVA = 20.0,
                    PrixUnitaireTTC = PrixUnitaire * 1.2
                WHERE PrixUnitaireHT = 0");

            // For LigneFactureVentes
            migrationBuilder.Sql(@"
                UPDATE LigneFactureVentes 
                SET PrixUnitaireHT = PrixUnitaire,
                    TauxTVA = 20.0,
                    PrixUnitaireTTC = PrixUnitaire * 1.2
                WHERE PrixUnitaireHT = 0");

            // For LigneFactureAchats
            migrationBuilder.Sql(@"
                UPDATE LigneFactureAchats 
                SET PrixUnitaireHT = PrixUnitaire,
                    TauxTVA = 20.0,
                    PrixUnitaireTTC = PrixUnitaire * 1.2
                WHERE PrixUnitaireHT = 0");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // In the down migration, we don't need to do anything as the columns will be dropped
            // when the previous migration is rolled back
        }
    }
}