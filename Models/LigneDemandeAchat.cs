using System;

namespace App.Models
{
    public class LigneDemandeAchat
    {
        public int Id { get; set; }
        public int DemandeId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
        public string Justification { get; set; }
    }
}
