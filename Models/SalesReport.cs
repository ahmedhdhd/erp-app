using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class SalesReport
    {
        public DateTime DateRapport { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal VentesTotales { get; set; }
        
        public int TotalCommandes { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ValeurMoyenneCommande { get; set; }
        
        public int ClientId { get; set; }
        public string NomClient { get; set; } = string.Empty;
        
        public int ProduitId { get; set; }
        public string NomProduit { get; set; } = string.Empty;
        
        public int EmployeId { get; set; }
        public string NomEmploye { get; set; } = string.Empty;
    }
}
