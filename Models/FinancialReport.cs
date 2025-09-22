using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class FinancialReport
    {
        public DateTime DateRapport { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ChiffreAffairesTotal { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal CoutsTotaux { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal BeneficeBrut { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal BeneficeNet { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal CreancesClients { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DettesFournisseurs { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal FluxTresorerie { get; set; }
    }
}
