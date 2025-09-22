using System;
using System.Collections.Generic;

namespace App.Models
{
    public class RapportAchat
    {
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public decimal DepensesTotales { get; set; }
        public int NombreFournisseurs { get; set; }
        public int NombreCommandes { get; set; }
        public Dictionary<string, decimal> AchatsParCategorie { get; set; } = new Dictionary<string, decimal>();
    }
}
