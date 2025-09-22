using System;

namespace App.Models
{
    public class LigneRetourVente
    {
        public int Id { get; set; }
        public int RetourId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
    }
}
