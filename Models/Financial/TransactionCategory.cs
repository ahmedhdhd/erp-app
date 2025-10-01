using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class TransactionCategory : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Nom { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty; // Income, Expense

        public int? ParentCategoryId { get; set; }
        public virtual TransactionCategory? ParentCategory { get; set; }

        public virtual ICollection<TransactionCategory> SousCategories { get; set; } = new List<TransactionCategory>();

        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}