using System;

namespace App.Models
{
    public class PaiementClient
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public int ClientId { get; set; }
        public DateTime DatePaiement { get; set; }
        public decimal Montant { get; set; }
        public string ModePaiement { get; set; } // Espèce, Chèque, Virement, Carte
        public string Reference { get; set; } // Numéro de chèque, référence virement
    }
}
