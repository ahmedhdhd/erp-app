using System;

namespace App.Models
{
    public class LigneDevis
    {
        public int Id { get; set; }
        public int DevisId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public decimal TotalLigne { get; set; }
    }
}
