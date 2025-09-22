using System;

namespace App.Models
{
    public class PerformanceFournisseur
    {
        public int Id { get; set; }
        public int FournisseurId { get; set; }
        public decimal VolumeAchatAnnuel { get; set; }
        public int TauxLivraisonATemps { get; set; } // %
        public decimal NotePerformance { get; set; } // 1-5
    }
}
