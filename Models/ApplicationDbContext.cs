using Microsoft.EntityFrameworkCore;

namespace App.Models;
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions options) : base(options)
    {
        
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ========== 1. Gestion de la Relation Client (CRM) ==========
        modelBuilder.Entity<Client>()
            .HasMany(c => c.Contacts)
            .WithOne()
            .HasForeignKey("ClientId")
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.HistoriqueAchats)
            .WithOne()
            .HasForeignKey(tc => tc.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Client>()
            .HasOne(c => c.Analyse)
            .WithOne()
            .HasForeignKey<AnalyseClient>(a => a.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // ========== 2. Gestion de la Relation Fournisseur (SRM) ==========
        modelBuilder.Entity<Fournisseur>()
            .HasMany(f => f.Contacts)
            .WithOne()
            .HasForeignKey("FournisseurId")
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Fournisseur>()
            .HasMany(f => f.HistoriqueAchats)
            .WithOne()
            .HasForeignKey(tf => tf.FournisseurId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Fournisseur>()
            .HasOne(f => f.Performance)
            .WithOne()
            .HasForeignKey<PerformanceFournisseur>(p => p.FournisseurId)
            .OnDelete(DeleteBehavior.Cascade);

        // ========== 3. Gestion des Ressources Humaines ==========
        modelBuilder.Entity<Employe>()
            .HasMany(e => e.Activites)
            .WithOne()
            .HasForeignKey(a => a.EmployeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Department>()
            .HasMany(d => d.Employes)
            .WithOne()
            .HasForeignKey("DepartmentId")
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Department>()
            .HasOne(d => d.Manager)
            .WithOne()
            .HasForeignKey<Department>(d => d.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // ========== 4. Gestion des Produits et Stocks ==========
        modelBuilder.Entity<Category>()
            .HasMany(c => c.SousCategories)
            .WithOne(c => c.CategorieParent)
            .HasForeignKey(c => c.CategorieParentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Category>()
            .HasMany(c => c.Produits)
            .WithOne()
            .HasForeignKey("CategoryId")
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Produit>()
            .HasMany(p => p.Variantes)
            .WithOne()
            .HasForeignKey(v => v.ProduitId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Produit>()
            .HasMany(p => p.Mouvements)
            .WithOne()
            .HasForeignKey(m => m.ProduitId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Produit>()
            .HasMany(p => p.Inventaires)
            .WithOne()
            .HasForeignKey(i => i.ProduitId)
            .OnDelete(DeleteBehavior.Cascade);

        // ========== 5. Gestion des Ventes ==========
        modelBuilder.Entity<Client>()
            .HasMany(c => c.Devis)
            .WithOne()
            .HasForeignKey(d => d.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Devis>()
            .HasMany(d => d.Lignes)
            .WithOne()
            .HasForeignKey(l => l.DevisId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.CommandesVente)
            .WithOne()
            .HasForeignKey(cv => cv.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CommandeVente>()
            .HasMany(cv => cv.Lignes)
            .WithOne()
            .HasForeignKey(l => l.CommandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CommandeVente>()
            .HasMany(cv => cv.Livraisons)
            .WithOne()
            .HasForeignKey(l => l.CommandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Livraison>()
            .HasMany(l => l.Lignes)
            .WithOne()
            .HasForeignKey(ll => ll.LivraisonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CommandeVente>()
            .HasMany(cv => cv.Factures)
            .WithOne()
            .HasForeignKey(f => f.CommandeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.Factures)
            .WithOne()
            .HasForeignKey(f => f.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FactureVente>()
            .HasMany(f => f.Lignes)
            .WithOne()
            .HasForeignKey(l => l.FactureId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FactureVente>()
            .HasMany(f => f.Retours)
            .WithOne()
            .HasForeignKey(r => r.FactureId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.Retours)
            .WithOne()
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RetourVente>()
            .HasMany(r => r.Lignes)
            .WithOne()
            .HasForeignKey(l => l.RetourId)
            .OnDelete(DeleteBehavior.Cascade);

        // ========== 6. Gestion des Achats ==========
        modelBuilder.Entity<Employe>()
            .HasMany(e => e.DemandesAchat)
            .WithOne()
            .HasForeignKey(da => da.EmployeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DemandeAchat>()
            .HasMany(da => da.Lignes)
            .WithOne()
            .HasForeignKey(l => l.DemandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Fournisseur>()
            .HasMany(f => f.CommandesAchat)
            .WithOne()
            .HasForeignKey(ca => ca.FournisseurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CommandeAchat>()
            .HasMany(ca => ca.Lignes)
            .WithOne()
            .HasForeignKey(l => l.CommandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CommandeAchat>()
            .HasMany(ca => ca.Receptions)
            .WithOne()
            .HasForeignKey(r => r.CommandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reception>()
            .HasMany(r => r.Lignes)
            .WithOne()
            .HasForeignKey(l => l.ReceptionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CommandeAchat>()
            .HasMany(ca => ca.Factures)
            .WithOne(f => f.Commande)
            .HasForeignKey(f => f.CommandeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Fournisseur>()
            .HasMany(f => f.Factures)
            .WithOne(f => f.Fournisseur)
            .HasForeignKey(f => f.FournisseurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FactureAchat>()
            .HasMany(f => f.Lignes)
            .WithOne(l => l.Facture)
            .HasForeignKey(l => l.FactureId)
            .OnDelete(DeleteBehavior.Cascade);

        // ========== 7. Gestion Financière ==========
        modelBuilder.Entity<FactureVente>()
            .HasMany(f => f.Paiements)
            .WithOne(p => p.Facture)
            .HasForeignKey(p => p.FactureId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.Paiements)
            .WithOne(p => p.Client)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FactureAchat>()
            .HasMany(f => f.Paiements)
            .WithOne(p => p.Facture)
            .HasForeignKey(p => p.FactureId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Fournisseur>()
            .HasMany(f => f.Paiements)
            .WithOne(p => p.Fournisseur)
            .HasForeignKey(p => p.FournisseurId)
            .OnDelete(DeleteBehavior.Restrict);

        // Additional configurations for Purchase Management
        modelBuilder.Entity<DemandeAchat>()
            .HasOne(da => da.Employe)
            .WithMany(e => e.DemandesAchat)
            .HasForeignKey(da => da.EmployeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LigneDemandeAchat>()
            .HasOne(l => l.Demande)
            .WithMany(d => d.Lignes)
            .HasForeignKey(l => l.DemandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LigneDemandeAchat>()
            .HasOne(l => l.Produit)
            .WithMany()
            .HasForeignKey(l => l.ProduitId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CommandeAchat>()
            .HasOne(ca => ca.Fournisseur)
            .WithMany(f => f.CommandesAchat)
            .HasForeignKey(ca => ca.FournisseurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LigneCommandeAchat>()
            .HasOne(l => l.Commande)
            .WithMany(c => c.Lignes)
            .HasForeignKey(l => l.CommandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LigneCommandeAchat>()
            .HasOne(l => l.Produit)
            .WithMany()
            .HasForeignKey(l => l.ProduitId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Reception>()
            .HasOne(r => r.Commande)
            .WithMany(c => c.Receptions)
            .HasForeignKey(r => r.CommandeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LigneReception>()
            .HasOne(l => l.Reception)
            .WithMany(r => r.Lignes)
            .HasForeignKey(l => l.ReceptionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LigneReception>()
            .HasOne(l => l.LigneCommande)
            .WithMany()
            .HasForeignKey(l => l.LigneCommandeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FactureAchat>()
            .HasOne(f => f.Commande)
            .WithMany(c => c.Factures)
            .HasForeignKey(f => f.CommandeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FactureAchat>()
            .HasOne(f => f.Fournisseur)
            .WithMany(f => f.Factures)
            .HasForeignKey(f => f.FournisseurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LigneFactureAchat>()
            .HasOne(l => l.Facture)
            .WithMany(f => f.Lignes)
            .HasForeignKey(l => l.FactureId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LigneFactureAchat>()
            .HasOne(l => l.LigneCommande)
            .WithMany()
            .HasForeignKey(l => l.LigneCommandeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PaiementFournisseur>()
            .HasOne(p => p.Facture)
            .WithMany(f => f.Paiements)
            .HasForeignKey(p => p.FactureId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PaiementFournisseur>()
            .HasOne(p => p.Fournisseur)
            .WithMany(f => f.Paiements)
            .HasForeignKey(p => p.FournisseurId)
            .OnDelete(DeleteBehavior.Restrict);

        // ========== 8. Administration Système ==========
        modelBuilder.Entity<Employe>()
            .HasOne(e => e.Utilisateur)
            .WithOne(u => u.Employe)
            .HasForeignKey<Utilisateur>(u => u.EmployeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Utilisateur>()
            .HasMany(u => u.AuditLogs)
            .WithOne()
            .HasForeignKey(a => a.UtilisateurId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure indexes
        modelBuilder.Entity<Client>().HasIndex(c => c.ICE).IsUnique();
        modelBuilder.Entity<Fournisseur>().HasIndex(f => f.ICE).IsUnique();
        modelBuilder.Entity<Employe>().HasIndex(e => e.CIN).IsUnique();
        modelBuilder.Entity<Utilisateur>().HasIndex(u => u.NomUtilisateur).IsUnique();
        modelBuilder.Entity<Produit>().HasIndex(p => p.Reference).IsUnique();
    }

    // ========== 1. Gestion de la Relation Client (CRM) ==========
    public DbSet<Client> Clients { get; set; }
    public DbSet<ContactClient> ContactClients { get; set; }
    public DbSet<TransactionClient> TransactionClients { get; set; }
    public DbSet<AnalyseClient> AnalyseClients { get; set; }

    // ========== 2. Gestion de la Relation Fournisseur (SRM) ==========
    public DbSet<Fournisseur> Fournisseurs { get; set; }
    public DbSet<ContactFournisseur> ContactFournisseurs { get; set; }
    public DbSet<TransactionFournisseur> TransactionFournisseurs { get; set; }
    public DbSet<PerformanceFournisseur> PerformanceFournisseurs { get; set; }

    // ========== 3. Gestion des Ressources Humaines ==========
    public DbSet<Employe> Employes { get; set; }
    public DbSet<ActiviteEmploye> ActiviteEmployes { get; set; }
    public DbSet<Department> Departments { get; set; }

    // ========== 4. Gestion des Produits et Stocks ==========
    public DbSet<Category> Categories { get; set; }
    public DbSet<Produit> Produits { get; set; }
    public DbSet<VariantProduit> VariantProduits { get; set; }
    public DbSet<MouvementStock> MouvementStocks { get; set; }
    public DbSet<Inventaire> Inventaires { get; set; }

    // ========== 5. Gestion des Ventes ==========
    public DbSet<Devis> Devis { get; set; }
    public DbSet<LigneDevis> LigneDevis { get; set; }
    public DbSet<CommandeVente> CommandeVentes { get; set; }
    public DbSet<LigneCommandeVente> LigneCommandeVentes { get; set; }
    public DbSet<Livraison> Livraisons { get; set; }
    public DbSet<LigneLivraison> LigneLivraisons { get; set; }
    public DbSet<FactureVente> FactureVentes { get; set; }
    public DbSet<LigneFactureVente> LigneFactureVentes { get; set; }
    public DbSet<RetourVente> RetourVentes { get; set; }
    public DbSet<LigneRetourVente> LigneRetourVentes { get; set; }

    // ========== 6. Gestion des Achats ==========
    public DbSet<DemandeAchat> DemandeAchats { get; set; }
    public DbSet<LigneDemandeAchat> LigneDemandeAchats { get; set; }
    public DbSet<CommandeAchat> CommandeAchats { get; set; }
    public DbSet<LigneCommandeAchat> LigneCommandeAchats { get; set; }
    public DbSet<Reception> Receptions { get; set; }
    public DbSet<LigneReception> LigneReceptions { get; set; }
    public DbSet<FactureAchat> FactureAchats { get; set; }
    public DbSet<LigneFactureAchat> LigneFactureAchats { get; set; }

    // ========== 7. Gestion Financière ==========
    public DbSet<PaiementClient> PaiementClients { get; set; }
    public DbSet<PaiementFournisseur> PaiementFournisseurs { get; set; }

    // ========== 8. Administration Système ==========
    public DbSet<Utilisateur> Utilisateurs { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<CompanySettings> CompanySettings { get; set; }
    public DbSet<ParametreSociete> ParametreSocietes { get; set; }
    public DbSet<SequenceNumerique> SequenceNumeriques { get; set; }

    // ========== 9. Reporting (These are typically not DbSets as they're for reporting purposes) ==========
    // public DbSet<RapportVente> RapportVentes { get; set; }
    // public DbSet<RapportAchat> RapportAchats { get; set; }
    // public DbSet<RapportStock> RapportStocks { get; set; }
    // public DbSet<SalesReport> SalesReports { get; set; }
    // public DbSet<InventoryReport> InventoryReports { get; set; }
    // public DbSet<FinancialReport> FinancialReports { get; set; }
}

