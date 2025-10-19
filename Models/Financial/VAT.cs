using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class VAT : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        public decimal Rate { get; set; } = 0;

        [StringLength(20)]
        public string? AccountCode { get; set; }

        public bool IsActive { get; set; } = true;

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}