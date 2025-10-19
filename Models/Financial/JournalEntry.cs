using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class JournalEntry : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string Reference { get; set; } = string.Empty;

        public int JournalId { get; set; }
        public Journal Journal { get; set; } = null!;

        public int AccountId { get; set; }
        public Account Account { get; set; } = null!;

        public int? PartnerId { get; set; }
        public Partner? Partner { get; set; }

        public int? InvoiceId { get; set; }
        public Invoice? Invoice { get; set; }

        public int? PaymentId { get; set; }
        public Payment? Payment { get; set; }

        public DateTime EntryDate { get; set; } = DateTime.Now;

        [Required]
        public EntryType Type { get; set; }

        public decimal Debit { get; set; } = 0;
        public decimal Credit { get; set; } = 0;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string? DocumentReference { get; set; }

        public bool IsPosted { get; set; } = false;
        public DateTime? PostedDate { get; set; }

        [StringLength(100)]
        public string? CreatedBy { get; set; }
    }

    public enum EntryType
    {
        Debit = 1,
        Credit = 2
    }
}