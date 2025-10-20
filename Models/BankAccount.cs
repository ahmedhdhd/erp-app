using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public class BankAccount : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string AccountNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string BankName { get; set; }

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; }

        [StringLength(10)]
        public string Currency { get; set; } = "TND"; // Tunisian Dinar

        public decimal Balance { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        [StringLength(200)]
        public string Description { get; set; }
    }
}
