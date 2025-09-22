using System;

namespace App.Models
{
    public class PaiementFournisseur
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public int FournisseurId { get; set; }
        public DateTime DatePaiement { get; set; }
        public decimal Montant { get; set; }
        public string ModePaiement { get; set; }
        public string Reference { get; set; }
    }
}
