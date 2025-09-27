using System;

namespace App.Models
{
    public class PaiementClient
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public FactureVente Facture { get; set; } // Ajout de la navigation property
        public int ClientId { get; set; }
        public Client Client { get; set; } // Ajout de la navigation property
        public DateTime DatePaiement { get; set; }
        public decimal Montant { get; set; }
        public string MethodePaiement { get; set; }
        public string Reference { get; set; }
        public string Statut { get; set; }
    }
}