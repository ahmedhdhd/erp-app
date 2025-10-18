using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class Journal : BaseEntity
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public JournalType Type { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public string? DefaultDebitAccountCode { get; set; }
        public string? DefaultCreditAccountCode { get; set; }

        public List<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
        public List<Invoice> Invoices { get; set; } = new List<Invoice>();
        public List<Payment> Payments { get; set; } = new List<Payment>();
    }

    public enum JournalType
    {
        Sales = 1,          // Vente
        Purchase = 2,       // Achat
        Bank = 3,          // Banque
        Cash = 4,          // Caisse
        Miscellaneous = 5  // Divers
    }
}
