using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class Reconciliation : BaseEntity
    {
        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public int PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;

        public int PaymentTrancheId { get; set; }
        public PaymentTranche PaymentTranche { get; set; } = null!;

        public DateTime ReconciliationDate { get; set; } = DateTime.Now;

        public decimal Amount { get; set; } = 0;

        [Required]
        public ReconciliationStatus Status { get; set; } = ReconciliationStatus.Pending;

        [StringLength(500)]
        public string? Notes { get; set; }

        public DateTime? PostedDate { get; set; }
    }

    public enum ReconciliationStatus
    {
        Pending = 1,     // En attente
        Completed = 2,   // Terminé
        Cancelled = 3    // Annulé
    }
}