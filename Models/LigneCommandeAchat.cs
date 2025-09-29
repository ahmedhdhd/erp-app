using System;

namespace App.Models
{
    public class LigneCommandeAchat
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public CommandeAchat Commande { get; set; } // Ajout de la navigation property
        public int ProduitId { get; set; }
        public Produit Produit { get; set; } // Ajout de la navigation property
        public int Quantite { get; set; }
        public decimal PrixUnitaireHT { get; set; }
        public decimal TauxTVA { get; set; }
        public decimal PrixUnitaireTTC { get; set; }
        public decimal TotalLigne { get; set; }
    }
}