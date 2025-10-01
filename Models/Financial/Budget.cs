using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models.Financial
{
    public class Budget : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Nom { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? CategoryId { get; set; }
        public virtual TransactionCategory? Category { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MontantPrevu { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MontantDepense { get; set; }

        [Required]
        public DateTime DateDebut { get; set; }

        [Required]
        public DateTime DateFin { get; set; }

        [StringLength(50)]
        public string Statut { get; set; } = "Actif"; // Actif, Inactif, Termine

        public string Notes { get; set; } = string.Empty;
    }
}