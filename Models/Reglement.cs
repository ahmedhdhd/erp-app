using System;

namespace App.Models
{
    public class Reglement
    {
        public int Id { get; set; }
        public string Nature { get; set; } // Espèce, Chèque, Virement, etc.
        public string Numero { get; set; }
        public decimal Montant { get; set; }
        public DateTime Date { get; set; }
        public string? Banque { get; set; }
        public DateTime? DateEcheance { get; set; }

        // Type: "Fournisseur" or "Client"
        public string Type { get; set; }

        // Owner linkage (one of these should be set according to Type)
        public int? FournisseurId { get; set; }
        public Fournisseur? Fournisseur { get; set; }
        public int? ClientId { get; set; }
        public Client? Client { get; set; }

        // Commande linkage (one of these should be set depending on module)
        public int? CommandeAchatId { get; set; }
        public CommandeAchat? CommandeAchat { get; set; }
        public int? CommandeVenteId { get; set; }
        public CommandeVente? CommandeVente { get; set; }
    }
}


