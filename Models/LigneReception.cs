using System;

namespace App.Models
{
    public class LigneReception
    {
        public int Id { get; set; }
        public int ReceptionId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
        public string Qualite { get; set; } // Conforme, Non conforme, À contrôler
    }
}
