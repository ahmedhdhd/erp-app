using System;

namespace App.Models
{
    public class TransactionClient
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public DateTime DateTransaction { get; set; }
        public decimal Montant { get; set; }
        public string Type { get; set; } // Achat, Paiement, Retour
        public string Reference { get; set; } // Numéro de facture ou bon de commande
    }
}
