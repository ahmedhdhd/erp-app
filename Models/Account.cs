using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public class Account : BaseEntity
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; } // Asset, Liability, Equity, Revenue, Expense

        public int? ParentId { get; set; }
        public Account? Parent { get; set; }
        public List<Account> Children { get; set; } = new List<Account>();

        public int Level { get; set; } = 1; // 1-5 for hierarchical structure

        public bool IsActive { get; set; } = true;

        public string Description { get; set; }

    }
}
