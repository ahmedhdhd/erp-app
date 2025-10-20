using System;

namespace App.Models
{
    public class Journal
    {
        public int Id { get; set; }
        public string Reference { get; set; }
        public DateTime Date { get; set; }
        public decimal Montant { get; set; }

        // "Fournisseur" or "Client"
        public string Type { get; set; }

        // Owner linkage
        public int? FournisseurId { get; set; }
        public Fournisseur? Fournisseur { get; set; }
        public int? ClientId { get; set; }
        public Client? Client { get; set; }

        public int ReglementId { get; set; }
        public Reglement Reglement { get; set; }

        public string Description { get; set; }
    }
}


