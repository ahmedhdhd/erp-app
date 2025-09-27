using System;
using System.Collections.Generic;

namespace App.Models
{
    public class FactureVente
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public CommandeVente Commande { get; set; } // Ajout de la navigation property
        public int ClientId { get; set; }
        public Client Client { get; set; } // Ajout de la navigation property
        public DateTime DateFacture { get; set; } = DateTime.Now;
        public DateTime DateEcheance { get; set; }
        public string Statut { get; set; } // Brouillon, Envoyée, Payée, Partielle, En retard
        public decimal MontantHT { get; set; }
        public decimal MontantTTC { get; set; }
        public decimal MontantPaye { get; set; }
        public List<LigneFactureVente> Lignes { get; set; } = new List<LigneFactureVente>();
        public List<RetourVente> Retours { get; set; } = new List<RetourVente>();
        public List<PaiementClient> Paiements { get; set; } = new List<PaiementClient>();
    }
}