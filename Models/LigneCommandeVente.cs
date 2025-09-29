using System;

namespace App.Models
{
    public class LigneCommandeVente
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public int ProduitId { get; set; }
        public Produit Produit { get; set; } // Ajout de la navigation property
        public int Quantite { get; set; }
        public decimal PrixUnitaireHT { get; set; }
        public decimal TauxTVA { get; set; }
        public decimal PrixUnitaireTTC { get; set; }
        public decimal TotalLigne { get; set; }
    }
}