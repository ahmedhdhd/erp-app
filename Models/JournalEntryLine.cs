using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public class JournalEntryLine : BaseEntity
    {
        [Required]
        public int JournalEntryId { get; set; }
        public JournalEntry JournalEntry { get; set; }

        [Required]
        public int AccountId { get; set; }
        public Account Account { get; set; }

        public decimal DebitAmount { get; set; } = 0;
        public decimal CreditAmount { get; set; } = 0;

        [StringLength(500)]
        public string Description { get; set; }

        // Reference to related entity (optional)
        public string? RelatedEntityType { get; set; } // Invoice, Payment, etc.
        public int? RelatedEntityId { get; set; }
    }
}
