using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public class Department : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Nom { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public int? ManagerId { get; set; }
        public bool EstActif { get; set; } = true;

        // Navigation Properties
        public virtual Employe? Manager { get; set; }
        public virtual ICollection<Employe> Employes { get; set; } = new List<Employe>();
    }
}
