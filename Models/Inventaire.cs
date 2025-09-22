using System;

namespace App.Models
{
    public class Inventaire
    {
        public int Id { get; set; }
        public int ProduitId { get; set; }
        public int QuantiteTheorique { get; set; }
        public int QuantiteReelle { get; set; }
        public DateTime DateInventaire { get; set; }
        public string Ecarts { get; set; }
    }
}
