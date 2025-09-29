using System;

namespace App.Models
{
    public class LigneFactureVente
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
        public decimal PrixUnitaireHT { get; set; }
        public decimal TauxTVA { get; set; }
        public decimal PrixUnitaireTTC { get; set; }
        public decimal TotalLigne { get; set; }
    }
}