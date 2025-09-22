using System;
using System.Collections.Generic;

namespace App.Models
{
    public class RapportStock
    {
        public DateTime DateInventaire { get; set; }
        public decimal ValeurStock { get; set; }
        public int NombreProduits { get; set; }
        public int NombreProduitsRupture { get; set; }
        public Dictionary<string, int> StockParCategorie { get; set; } = new Dictionary<string, int>();
    }
}
