using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class InventoryReport
    {
        public int ProduitId { get; set; }
        public string NomProduit { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public int StockActuel { get; set; }
        public int NiveauReapprovisionnement { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ValeurStock { get; set; }
        
        public string NomCategorie { get; set; } = string.Empty;
        public int JoursEnStock { get; set; }
        public string StatutStock { get; set; } = string.Empty; // Faible, Normal, Excessif
    }
}
