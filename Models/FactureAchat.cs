using System;
using System.Collections.Generic;

namespace App.Models
{
    public class FactureAchat
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public int FournisseurId { get; set; }
        public DateTime DateFacture { get; set; }
        public DateTime DateEcheance { get; set; }
        public string Statut { get; set; } // Reçue, Validée, Payée, En retard
        public decimal MontantHT { get; set; }
        public decimal MontantTTC { get; set; }
        public decimal MontantPaye { get; set; }
        public List<LigneFactureAchat> Lignes { get; set; } = new List<LigneFactureAchat>();
        public List<PaiementFournisseur> Paiements { get; set; } = new List<PaiementFournisseur>();
    }
}
