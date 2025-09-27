using System;
using System.Collections.Generic;

namespace App.Models
{
    public class CommandeVente
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public Client Client { get; set; } // Ajout de la navigation property
        public int? DevisId { get; set; }
        public Devis? Devis { get; set; } // Ajout de la navigation property
        public DateTime DateCommande { get; set; } = DateTime.Now;
        public string Statut { get; set; } // Brouillon, Confirmé, Expédié, Livré, Annulé
        public decimal MontantHT { get; set; }
        public decimal MontantTTC { get; set; }
        public string ModeLivraison { get; set; }
        public string ConditionsPaiement { get; set; }
        public List<LigneCommandeVente> Lignes { get; set; } = new List<LigneCommandeVente>();
        public List<Livraison> Livraisons { get; set; } = new List<Livraison>();
        public List<FactureVente> Factures { get; set; } = new List<FactureVente>();
    }
}