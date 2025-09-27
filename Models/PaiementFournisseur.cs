using System;

namespace App.Models
{
    public class PaiementFournisseur
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public FactureAchat Facture { get; set; } // Ajout de la navigation property
        public int FournisseurId { get; set; }
        public Fournisseur Fournisseur { get; set; } // Ajout de la navigation property
        public DateTime DatePaiement { get; set; }
        public decimal Montant { get; set; }
        public string MethodePaiement { get; set; }
        public string Reference { get; set; }
        public string Statut { get; set; }
    }
}