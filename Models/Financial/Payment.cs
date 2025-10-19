using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class Payment : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string PaymentNumber { get; set; } = string.Empty;

        public int PartnerId { get; set; }
        public Partner Partner { get; set; } = null!;

        public int JournalId { get; set; }
        public Journal Journal { get; set; } = null!;

        public DateTime PaymentDate { get; set; } = DateTime.Now;

        [Required]
        public PaymentType Type { get; set; }

        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Draft;

        public decimal Amount { get; set; } = 0;

        [Required]
        public PaymentMethod Method { get; set; }

        [StringLength(100)]
        public string? BankReference { get; set; }

        [StringLength(50)]
        public string? CheckNumber { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        public DateTime? PostedDate { get; set; }

        public List<PaymentTranche> PaymentTranches { get; set; } = new List<PaymentTranche>();
        public List<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
    }

    public enum PaymentType
    {
        Incoming = 1,    // Encaissement
        Outgoing = 2     // Décaissement
    }

    public enum PaymentStatus
    {
        Draft = 1,       // Brouillon
        Validated = 2,   // Validé
        Posted = 3,      // Comptabilisé
        Cancelled = 4    // Annulé
    }

    public enum PaymentMethod
    {
        Cash = 1,        // Espèces
        BankTransfer = 2, // Virement
        Check = 3,       // Chèque
        CreditCard = 4,  // Carte de crédit
        Other = 5        // Autre
    }
}