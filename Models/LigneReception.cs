using System;

namespace App.Models
{
    public class LigneReception
    {
        public int Id { get; set; }
        public int ReceptionId { get; set; }
        public Reception Reception { get; set; }
        public int? LigneCommandeId { get; set; }
        public LigneCommandeAchat LigneCommande { get; set; }
        public int ProduitId { get; set; }
        public int QuantiteRecue { get; set; }
        public int QuantiteRejetee { get; set; }
        public string MotifRejet { get; set; }
        public string Qualite { get; set; }
    }
}