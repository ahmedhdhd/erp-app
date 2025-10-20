using System;
using System.Collections.Generic;

namespace App.Models
{
    public class CommandeAchat
    {
        public int Id { get; set; }
        public int FournisseurId { get; set; }
        public Fournisseur Fournisseur { get; set; } // Ajout de la navigation property
        public int? DemandeId { get; set; }
        public DateTime DateCommande { get; set; } = DateTime.Now;
        public DateTime DateLivraisonPrevue { get; set; }
        public string Statut { get; set; } // Brouillon, Envoyée, Partielle, Livrée, Annulée
        public decimal MontantHT { get; set; }
        public decimal MontantTTC { get; set; }
        public List<LigneCommandeAchat> Lignes { get; set; } = new List<LigneCommandeAchat>();
        public List<Reception> Receptions { get; set; } = new List<Reception>();
        public List<FactureAchat> Factures { get; set; } = new List<FactureAchat>();
        public List<Reglement> Reglements { get; set; } = new List<Reglement>();
    }
}