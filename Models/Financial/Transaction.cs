using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models.Financial
{
    public class Transaction : BaseEntity
    {
        [Required]
        public string Type { get; set; } = string.Empty; // Income, Expense, Transfer

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Montant { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime DateTransaction { get; set; }

        public int? ClientId { get; set; }
        public virtual Client? Client { get; set; }

        public int? FournisseurId { get; set; }
        public virtual Fournisseur? Fournisseur { get; set; }

        public int? EmployeId { get; set; }
        public virtual Employe? Employe { get; set; }

        public int? CategoryId { get; set; }
        public virtual TransactionCategory? Category { get; set; }

        [StringLength(50)]
        public string Statut { get; set; } = "En attente"; // En attente, Complété, Annulé

        [StringLength(100)]
        public string MethodePaiement { get; set; } = string.Empty; // Espèces, Chèque, Virement, Carte

        [StringLength(100)]
        public string Reference { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;
    }
}