using System;
using System.Collections.Generic;

namespace App.Models
{
    public class RapportVente
    {
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public decimal ChiffreAffaires { get; set; }
        public decimal MargeBrute { get; set; }
        public int NombreClients { get; set; }
        public int NombreCommandes { get; set; }
        public Dictionary<string, decimal> VentesParCategorie { get; set; } = new Dictionary<string, decimal>();
    }
}
