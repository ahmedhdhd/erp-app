using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class CompanySettings : BaseEntity
    {
        [Required]
        [StringLength(200)]
        public string NomSociete { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Adresse { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string Telephone { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [StringLength(20)]
        public string ICE { get; set; } = string.Empty;
        
        [StringLength(10)]
        public string Devise { get; set; } = "TND";
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal TauxTVA { get; set; } = 19; // TVA standard en Tunisie
        
        [StringLength(100)]
        public string Logo { get; set; } = string.Empty;
    }
}
