using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class PaymentTranche : BaseEntity
    {
        public int PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;

        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public DateTime PaymentDate { get; set; } = DateTime.Now;

        public decimal Amount { get; set; } = 0;

        [Required]
        public TrancheStatus Status { get; set; } = TrancheStatus.Draft;

        [StringLength(100)]
        public string? Reference { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        public DateTime? PostedDate { get; set; }
    }

    public enum TrancheStatus
    {
        Draft = 1,       // Brouillon
        Validated = 2,   // Validé
        Posted = 3,      // Comptabilisé
        Cancelled = 4    // Annulé
    }
}