using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models.Financial
{
    public class FinancialReport : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Titre { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime DateDebut { get; set; }

        [Required]
        public DateTime DateFin { get; set; }

        public DateTime DateGeneration { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RevenusTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DepensesTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Profit { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TauxCroissance { get; set; }

        public string Contenu { get; set; } = string.Empty;

        [StringLength(50)]
        public string Type { get; set; } = "Mensuel"; // Mensuel, Trimestriel, Annuel

        [StringLength(50)]
        public string Statut { get; set; } = "Genere"; // Genere, Archive
    }
}