using System;

namespace App.Models
{
    public class AccountingEntry
    {
        public int Id { get; set; }
        public int JournalId { get; set; }
        public Journal Journal { get; set; }
        public string CompteDebit { get; set; }
        public string CompteCredit { get; set; }
        public decimal Montant { get; set; }
        public DateTime Date { get; set; }
    }
}


