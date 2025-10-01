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
        
        [StringLength(50)]
        public string RC { get; set; } = string.Empty; // Registre de Commerce
        
        [StringLength(50)]
        public string MF { get; set; } = string.Empty; // Matricule Fiscal
        
        [StringLength(50)]
        public string RIB { get; set; } = string.Empty; // Relevé d'Identité Bancaire
        
        [StringLength(10)]
        public string Devise { get; set; } = "TND";
        
        public decimal TauxTVA { get; set; } = 19; // TVA standard en Tunisie
        
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
        
        [StringLength(50)]
        public string RC { get; set; } = string.Empty; // Registre de Commerce
        
        [StringLength(50)]
        public string MF { get; set; } = string.Empty; // Matricule Fiscal
        
        [StringLength(50)]
        public string RIB { get; set; } = string.Empty; // Relevé d'Identité Bancaire
        
        [StringLength(10)]
        public string Devise { get; set; } = "TND";
        
        public decimal TauxTVA { get; set; } = 19;
        
        public string Logo { get; set; } = string.Empty;
    }
}