using System;

namespace App.Models
{
    public class LigneDevis
    {
        public int Id { get; set; }
        public int DevisId { get; set; }
        public int ProduitId { get; set; }
        public Produit Produit { get; set; } // Ajout de la navigation property
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public decimal TotalLigne { get; set; }
    }
}