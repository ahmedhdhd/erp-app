using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class Partner : BaseEntity
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Code { get; set; }

        [Required]
        public PartnerType Type { get; set; }

        [StringLength(20)]
        public string? ICE { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(20)]
        public string? PostalCode { get; set; }

        [StringLength(100)]
        public string Country { get; set; } = "Tunisie";

        [StringLength(20)]
        public string? Phone { get; set; }

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? TaxNumber { get; set; }

        public decimal CreditLimit { get; set; } = 0;
        public decimal CurrentBalance { get; set; } = 0;
        public decimal TotalDebit { get; set; } = 0;
        public decimal TotalCredit { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public List<Invoice> Invoices { get; set; } = new List<Invoice>();
        public List<Payment> Payments { get; set; } = new List<Payment>();
        public List<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
    }

    public enum PartnerType
    {
        Client = 1,
        Supplier = 2,
        Both = 3
    }
}