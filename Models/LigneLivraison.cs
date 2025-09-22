using System;

namespace App.Models
{
    public class LigneLivraison
    {
        public int Id { get; set; }
        public int LivraisonId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
    }
}
