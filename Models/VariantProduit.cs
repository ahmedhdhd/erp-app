using System;

namespace App.Models
{
    public class VariantProduit
    {
        public int Id { get; set; }
        public int ProduitId { get; set; }
        public string Taille { get; set; }
        public string Couleur { get; set; }
        public string ReferenceVariant { get; set; }
        public int StockActuel { get; set; }
    }
}
