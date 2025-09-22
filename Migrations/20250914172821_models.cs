using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Migrations
{
    public partial class models : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Languages");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CategorieParentId = table.Column<int>(type: "int", nullable: true),
                    EstActif = table.Column<bool>(type: "bit", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateModification = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreePar = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiePar = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Categories_CategorieParentId",
                        column: x => x.CategorieParentId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prenom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RaisonSociale = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeClient = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ICE = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ville = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodePostal = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pays = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Classification = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LimiteCredit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoldeActuel = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstActif = table.Column<bool>(type: "bit", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompanySettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomSociete = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ICE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Devise = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TauxTVA = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateModification = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreePar = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiePar = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanySettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fournisseurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RaisonSociale = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeFournisseur = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ICE = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ville = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodePostal = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pays = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConditionsPaiement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DelaiLivraisonMoyen = table.Column<int>(type: "int", nullable: false),
                    NoteQualite = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fournisseurs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParametreSocietes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomSociete = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ICE = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ville = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Devise = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TauxTVA = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParametreSocietes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SequenceNumeriques",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeDocument = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prefixe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProchainNumero = table.Column<int>(type: "int", nullable: false),
                    Longueur = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SequenceNumeriques", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Produits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Reference = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Categorie = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SousCategorie = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrixAchat = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PrixVente = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PrixVenteMin = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Unite = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StockActuel = table.Column<int>(type: "int", nullable: false),
                    StockMinimum = table.Column<int>(type: "int", nullable: false),
                    StockMaximum = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Produits_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AnalyseClients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    ValeurVieClient = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NombreTransactions = table.Column<int>(type: "int", nullable: false),
                    MontantMoyenAchat = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RisqueCredit = table.Column<int>(type: "int", nullable: false),
                    Segment = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnalyseClients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnalyseClients_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommandeVentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DevisId = table.Column<int>(type: "int", nullable: false),
                    DateCommande = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MontantHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ModeLivraison = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConditionsPaiement = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommandeVentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommandeVentes_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContactClients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Poste = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactClients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactClients_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Devis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateExpiration = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MontantHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remise = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Devis_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TransactionClients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DateTransaction = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionClients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransactionClients_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommandeAchats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FournisseurId = table.Column<int>(type: "int", nullable: false),
                    DemandeId = table.Column<int>(type: "int", nullable: false),
                    DateCommande = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateLivraisonPrevue = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MontantHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommandeAchats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommandeAchats_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContactFournisseurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Poste = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FournisseurId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactFournisseurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactFournisseurs_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceFournisseurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FournisseurId = table.Column<int>(type: "int", nullable: false),
                    VolumeAchatAnnuel = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TauxLivraisonATemps = table.Column<int>(type: "int", nullable: false),
                    NotePerformance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceFournisseurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerformanceFournisseurs_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransactionFournisseurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FournisseurId = table.Column<int>(type: "int", nullable: false),
                    DateTransaction = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionFournisseurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransactionFournisseurs_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inventaires",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    QuantiteTheorique = table.Column<int>(type: "int", nullable: false),
                    QuantiteReelle = table.Column<int>(type: "int", nullable: false),
                    DateInventaire = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ecarts = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventaires", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inventaires_Produits_ProduitId",
                        column: x => x.ProduitId,
                        principalTable: "Produits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MouvementStocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    DateMouvement = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    ReferenceDocument = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Emplacement = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MouvementStocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MouvementStocks_Produits_ProduitId",
                        column: x => x.ProduitId,
                        principalTable: "Produits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VariantProduits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Taille = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Couleur = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceVariant = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StockActuel = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VariantProduits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VariantProduits_Produits_ProduitId",
                        column: x => x.ProduitId,
                        principalTable: "Produits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FactureVentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommandeId = table.Column<int>(type: "int", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DateFacture = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateEcheance = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MontantHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantPaye = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactureVentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FactureVentes_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FactureVentes_CommandeVentes_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "CommandeVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LigneCommandeVentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommandeId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLigne = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneCommandeVentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneCommandeVentes_CommandeVentes_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "CommandeVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Livraisons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommandeId = table.Column<int>(type: "int", nullable: false),
                    DateLivraison = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transportateur = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NumeroSuivi = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Livraisons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Livraisons_CommandeVentes_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "CommandeVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LigneDevis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DevisId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLigne = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneDevis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneDevis_Devis_DevisId",
                        column: x => x.DevisId,
                        principalTable: "Devis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FactureAchats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommandeId = table.Column<int>(type: "int", nullable: false),
                    FournisseurId = table.Column<int>(type: "int", nullable: false),
                    DateFacture = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateEcheance = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MontantHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantPaye = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactureAchats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FactureAchats_CommandeAchats_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "CommandeAchats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FactureAchats_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LigneCommandeAchats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommandeId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLigne = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneCommandeAchats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneCommandeAchats_CommandeAchats_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "CommandeAchats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Receptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommandeId = table.Column<int>(type: "int", nullable: false),
                    DateReception = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Receptions_CommandeAchats_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "CommandeAchats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LigneFactureVentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FactureId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLigne = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneFactureVentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneFactureVentes_FactureVentes_FactureId",
                        column: x => x.FactureId,
                        principalTable: "FactureVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaiementClients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FactureId = table.Column<int>(type: "int", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DatePaiement = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ModePaiement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaiementClients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaiementClients_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PaiementClients_FactureVentes_FactureId",
                        column: x => x.FactureId,
                        principalTable: "FactureVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RetourVentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FactureId = table.Column<int>(type: "int", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DateRetour = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Motif = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetourVentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetourVentes_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetourVentes_FactureVentes_FactureId",
                        column: x => x.FactureId,
                        principalTable: "FactureVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LigneLivraisons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LivraisonId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneLivraisons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneLivraisons_Livraisons_LivraisonId",
                        column: x => x.LivraisonId,
                        principalTable: "Livraisons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LigneFactureAchats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FactureId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLigne = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneFactureAchats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneFactureAchats_FactureAchats_FactureId",
                        column: x => x.FactureId,
                        principalTable: "FactureAchats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaiementFournisseurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FactureId = table.Column<int>(type: "int", nullable: false),
                    FournisseurId = table.Column<int>(type: "int", nullable: false),
                    DatePaiement = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ModePaiement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaiementFournisseurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaiementFournisseurs_FactureAchats_FactureId",
                        column: x => x.FactureId,
                        principalTable: "FactureAchats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaiementFournisseurs_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LigneReceptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReceptionId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    Qualite = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneReceptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneReceptions_Receptions_ReceptionId",
                        column: x => x.ReceptionId,
                        principalTable: "Receptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LigneRetourVentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RetourId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneRetourVentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneRetourVentes_RetourVentes_RetourId",
                        column: x => x.RetourId,
                        principalTable: "RetourVentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActiviteEmployes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeId = table.Column<int>(type: "int", nullable: false),
                    DateActivite = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActiviteEmployes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UtilisateurId = table.Column<int>(type: "int", nullable: false),
                    DateAction = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TableAffectee = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AncienneValeur = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NouvelleValeur = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DemandeAchats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeId = table.Column<int>(type: "int", nullable: false),
                    DateDemande = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemandeAchats", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LigneDemandeAchats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DemandeId = table.Column<int>(type: "int", nullable: false),
                    ProduitId = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LigneDemandeAchats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LigneDemandeAchats_DemandeAchats_DemandeId",
                        column: x => x.DemandeId,
                        principalTable: "DemandeAchats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ManagerId = table.Column<int>(type: "int", nullable: true),
                    EstActif = table.Column<bool>(type: "bit", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateModification = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreePar = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiePar = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prenom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CIN = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Poste = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Departement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SalaireBase = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Prime = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DateEmbauche = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employes_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Utilisateurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomUtilisateur = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MotDePasse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmployeId = table.Column<int>(type: "int", nullable: false),
                    EstActif = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utilisateurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Utilisateurs_Employes_EmployeId",
                        column: x => x.EmployeId,
                        principalTable: "Employes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActiviteEmployes_EmployeId",
                table: "ActiviteEmployes",
                column: "EmployeId");

            migrationBuilder.CreateIndex(
                name: "IX_AnalyseClients_ClientId",
                table: "AnalyseClients",
                column: "ClientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UtilisateurId",
                table: "AuditLogs",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_CategorieParentId",
                table: "Categories",
                column: "CategorieParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_ICE",
                table: "Clients",
                column: "ICE",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommandeAchats_FournisseurId",
                table: "CommandeAchats",
                column: "FournisseurId");

            migrationBuilder.CreateIndex(
                name: "IX_CommandeVentes_ClientId",
                table: "CommandeVentes",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactClients_ClientId",
                table: "ContactClients",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactFournisseurs_FournisseurId",
                table: "ContactFournisseurs",
                column: "FournisseurId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeAchats_EmployeId",
                table: "DemandeAchats",
                column: "EmployeId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ManagerId",
                table: "Departments",
                column: "ManagerId",
                unique: true,
                filter: "[ManagerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Devis_ClientId",
                table: "Devis",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Employes_CIN",
                table: "Employes",
                column: "CIN",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employes_DepartmentId",
                table: "Employes",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_FactureAchats_CommandeId",
                table: "FactureAchats",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_FactureAchats_FournisseurId",
                table: "FactureAchats",
                column: "FournisseurId");

            migrationBuilder.CreateIndex(
                name: "IX_FactureVentes_ClientId",
                table: "FactureVentes",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_FactureVentes_CommandeId",
                table: "FactureVentes",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_Fournisseurs_ICE",
                table: "Fournisseurs",
                column: "ICE",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventaires_ProduitId",
                table: "Inventaires",
                column: "ProduitId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneCommandeAchats_CommandeId",
                table: "LigneCommandeAchats",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneCommandeVentes_CommandeId",
                table: "LigneCommandeVentes",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneDemandeAchats_DemandeId",
                table: "LigneDemandeAchats",
                column: "DemandeId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneDevis_DevisId",
                table: "LigneDevis",
                column: "DevisId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneFactureAchats_FactureId",
                table: "LigneFactureAchats",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneFactureVentes_FactureId",
                table: "LigneFactureVentes",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneLivraisons_LivraisonId",
                table: "LigneLivraisons",
                column: "LivraisonId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneReceptions_ReceptionId",
                table: "LigneReceptions",
                column: "ReceptionId");

            migrationBuilder.CreateIndex(
                name: "IX_LigneRetourVentes_RetourId",
                table: "LigneRetourVentes",
                column: "RetourId");

            migrationBuilder.CreateIndex(
                name: "IX_Livraisons_CommandeId",
                table: "Livraisons",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_MouvementStocks_ProduitId",
                table: "MouvementStocks",
                column: "ProduitId");

            migrationBuilder.CreateIndex(
                name: "IX_PaiementClients_ClientId",
                table: "PaiementClients",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_PaiementClients_FactureId",
                table: "PaiementClients",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_PaiementFournisseurs_FactureId",
                table: "PaiementFournisseurs",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_PaiementFournisseurs_FournisseurId",
                table: "PaiementFournisseurs",
                column: "FournisseurId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceFournisseurs_FournisseurId",
                table: "PerformanceFournisseurs",
                column: "FournisseurId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Produits_CategoryId",
                table: "Produits",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Produits_Reference",
                table: "Produits",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Receptions_CommandeId",
                table: "Receptions",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_RetourVentes_ClientId",
                table: "RetourVentes",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_RetourVentes_FactureId",
                table: "RetourVentes",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionClients_ClientId",
                table: "TransactionClients",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionFournisseurs_FournisseurId",
                table: "TransactionFournisseurs",
                column: "FournisseurId");

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_EmployeId",
                table: "Utilisateurs",
                column: "EmployeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_NomUtilisateur",
                table: "Utilisateurs",
                column: "NomUtilisateur",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VariantProduits_ProduitId",
                table: "VariantProduits",
                column: "ProduitId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActiviteEmployes_Employes_EmployeId",
                table: "ActiviteEmployes",
                column: "EmployeId",
                principalTable: "Employes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Utilisateurs_UtilisateurId",
                table: "AuditLogs",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
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
                name: "FK_Departments_Employes_ManagerId",
                table: "Departments",
                column: "ManagerId",
                principalTable: "Employes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Employes_ManagerId",
                table: "Departments");

            migrationBuilder.DropTable(
                name: "ActiviteEmployes");

            migrationBuilder.DropTable(
                name: "AnalyseClients");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CompanySettings");

            migrationBuilder.DropTable(
                name: "ContactClients");

            migrationBuilder.DropTable(
                name: "ContactFournisseurs");

            migrationBuilder.DropTable(
                name: "Inventaires");

            migrationBuilder.DropTable(
                name: "LigneCommandeAchats");

            migrationBuilder.DropTable(
                name: "LigneCommandeVentes");

            migrationBuilder.DropTable(
                name: "LigneDemandeAchats");

            migrationBuilder.DropTable(
                name: "LigneDevis");

            migrationBuilder.DropTable(
                name: "LigneFactureAchats");

            migrationBuilder.DropTable(
                name: "LigneFactureVentes");

            migrationBuilder.DropTable(
                name: "LigneLivraisons");

            migrationBuilder.DropTable(
                name: "LigneReceptions");

            migrationBuilder.DropTable(
                name: "LigneRetourVentes");

            migrationBuilder.DropTable(
                name: "MouvementStocks");

            migrationBuilder.DropTable(
                name: "PaiementClients");

            migrationBuilder.DropTable(
                name: "PaiementFournisseurs");

            migrationBuilder.DropTable(
                name: "ParametreSocietes");

            migrationBuilder.DropTable(
                name: "PerformanceFournisseurs");

            migrationBuilder.DropTable(
                name: "SequenceNumeriques");

            migrationBuilder.DropTable(
                name: "TransactionClients");

            migrationBuilder.DropTable(
                name: "TransactionFournisseurs");

            migrationBuilder.DropTable(
                name: "VariantProduits");

            migrationBuilder.DropTable(
                name: "Utilisateurs");

            migrationBuilder.DropTable(
                name: "DemandeAchats");

            migrationBuilder.DropTable(
                name: "Devis");

            migrationBuilder.DropTable(
                name: "Livraisons");

            migrationBuilder.DropTable(
                name: "Receptions");

            migrationBuilder.DropTable(
                name: "RetourVentes");

            migrationBuilder.DropTable(
                name: "FactureAchats");

            migrationBuilder.DropTable(
                name: "Produits");

            migrationBuilder.DropTable(
                name: "FactureVentes");

            migrationBuilder.DropTable(
                name: "CommandeAchats");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "CommandeVentes");

            migrationBuilder.DropTable(
                name: "Fournisseurs");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Employes");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Account_Name = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    LoB = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    SaltKey = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Languages",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Language_Name = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Languages", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Account = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    DoB = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    LoB = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    National_ID = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.ID);
                });
        }
    }
}
