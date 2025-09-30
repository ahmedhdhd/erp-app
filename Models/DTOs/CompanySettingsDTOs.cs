using System;
using System.ComponentModel.DataAnnotations;

namespace App.Models.DTOs
{
    public class CompanySettingsDTO
    {
        public int Id { get; set; }
        
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
        
        public decimal TauxTVA { get; set; } = 19; // TVA standard en Tunisie
        
        [StringLength(100)]
        public string Logo { get; set; } = string.Empty;
        
        public DateTime DateCreation { get; set; }
        public DateTime? DateModification { get; set; }
    }

    public class UpdateCompanySettingsRequest
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
        
        public decimal TauxTVA { get; set; } = 19;
        
        [StringLength(100)]
        public string Logo { get; set; } = string.Empty;
    }


}