using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class InvoiceLine : BaseEntity
    {
        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string? ProductCode { get; set; }

        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0;
        public decimal Discount { get; set; } = 0;
        public decimal DiscountAmount { get; set; } = 0;
        public decimal LineTotal { get; set; } = 0;
        public decimal VATRate { get; set; } = 0;
        public decimal VATAmount { get; set; } = 0;
        public decimal LineTotalWithVAT { get; set; } = 0;

        [StringLength(20)]
        public string? Unit { get; set; } = "Unité";

        [StringLength(100)]
        public string? AccountCode { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}