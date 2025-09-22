using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public class Category : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Nom { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public int? CategorieParentId { get; set; }
        public bool EstActif { get; set; } = true;

        // Navigation Properties
        public virtual Category? CategorieParent { get; set; }
        public virtual ICollection<Category> SousCategories { get; set; } = new List<Category>();
        public virtual ICollection<Produit> Produits { get; set; } = new List<Produit>();
    }
}
