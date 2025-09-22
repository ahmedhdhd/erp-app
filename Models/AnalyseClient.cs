using System;

namespace App.Models
{
    public class AnalyseClient
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public decimal ValeurVieClient { get; set; }
        public int NombreTransactions { get; set; }
        public decimal MontantMoyenAchat { get; set; }
        public int RisqueCredit { get; set; } // 1-5
        public string Segment { get; set; } // Premium, Standard, Risque
    }
}
