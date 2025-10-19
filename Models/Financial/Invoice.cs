using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class Invoice : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        public int PartnerId { get; set; }
        public Partner Partner { get; set; } = null!;

        public int JournalId { get; set; }
        public Journal Journal { get; set; } = null!;

        public DateTime InvoiceDate { get; set; } = DateTime.Now;
        public DateTime? DueDate { get; set; }

        [Required]
        public InvoiceType Type { get; set; }

        [Required]
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

        public decimal SubTotal { get; set; } = 0;        // HT
        public decimal VATAmount { get; set; } = 0;       // TVA
        public decimal TotalAmount { get; set; } = 0;     // TTC

        public decimal PaidAmount { get; set; } = 0;
        public decimal RemainingAmount { get; set; } = 0;

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(100)]
        public string? Reference { get; set; }

        public DateTime? PostedDate { get; set; }
        public DateTime? PaidDate { get; set; }

        public List<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();
        public List<PaymentTranche> PaymentTranches { get; set; } = new List<PaymentTranche>();
        public List<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
    }

    public enum InvoiceType
    {
        Sales = 1,          // Facture de vente
        Purchase = 2,       // Facture d'achat
        CreditNote = 3,     // Avoir
        DebitNote = 4       // Note de débit
    }

    public enum InvoiceStatus
    {
        Draft = 1,          // Brouillon
        Validated = 2,      // Validée
        Posted = 3,         // Comptabilisée
        Paid = 4,           // Payée
        Partial = 5,        // Partiellement payée
        Cancelled = 6       // Annulée
    }
}