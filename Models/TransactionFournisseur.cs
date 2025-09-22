using System;

namespace App.Models
{
    public class TransactionFournisseur
    {
        public int Id { get; set; }
        public int FournisseurId { get; set; }
        public DateTime DateTransaction { get; set; }
        public decimal Montant { get; set; }
        public string Type { get; set; } // Achat, Paiement, Retour
    }
}
