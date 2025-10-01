using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace App.Models.DTOs
{
    // ApiResponse class for financial module
    public class FinancialApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T? Data { get; set; }
        public int? TotalCount { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
        public int? TotalPages { get; set; }
        public bool? HasNextPage { get; set; }
        public bool? HasPreviousPage { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public List<string> Errors { get; set; } = new();
    }

    // Transaction DTOs
    public class TransactionDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Montant { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DateTransaction { get; set; }
        public int? ClientId { get; set; }
        public string? ClientNom { get; set; }
        public int? FournisseurId { get; set; }
        public string? FournisseurNom { get; set; }
        public int? EmployeId { get; set; }
        public string? EmployeNom { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryNom { get; set; }
        public string Statut { get; set; } = "En attente";
        public string MethodePaiement { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime DateCreation { get; set; }
        public DateTime DateModification { get; set; }
    }

    public class CreateTransactionRequest
    {
        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le montant doit être supérieur à zéro")]
        public decimal Montant { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime DateTransaction { get; set; }

        public int? ClientId { get; set; }
        public int? FournisseurId { get; set; }
        public int? EmployeId { get; set; }
        public int? CategoryId { get; set; }

        public string Statut { get; set; } = "En attente";
        public string MethodePaiement { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class UpdateTransactionRequest : CreateTransactionRequest
    {
        public int Id { get; set; }
    }

    // Category DTOs
    public class TransactionCategoryDTO
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? ParentCategoryId { get; set; }
        public string? ParentCategoryNom { get; set; }
        public DateTime DateCreation { get; set; }
        public DateTime DateModification { get; set; }
    }

    public class CreateCategoryRequest
    {
        [Required]
        public string Nom { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty; // Income, Expense

        public int? ParentCategoryId { get; set; }
    }

    public class UpdateCategoryRequest : CreateCategoryRequest
    {
        public int Id { get; set; }
    }

    // Budget DTOs
    public class BudgetDTO
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string? CategoryNom { get; set; }
        public decimal MontantPrevu { get; set; }
        public decimal MontantDepense { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string Statut { get; set; } = "Actif";
        public string Notes { get; set; } = string.Empty;
        public DateTime DateCreation { get; set; }
        public DateTime DateModification { get; set; }
    }

    public class CreateBudgetRequest
    {
        [Required]
        public string Nom { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? CategoryId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le montant prévu doit être supérieur à zéro")]
        public decimal MontantPrevu { get; set; }

        public decimal MontantDepense { get; set; } = 0;

        [Required]
        public DateTime DateDebut { get; set; }

        [Required]
        public DateTime DateFin { get; set; }

        public string Statut { get; set; } = "Actif";
        public string Notes { get; set; } = string.Empty;
    }

    public class UpdateBudgetRequest : CreateBudgetRequest
    {
        public int Id { get; set; }
    }

    // Report DTOs
    public class FinancialReportDTO
    {
        public int Id { get; set; }
        public string Titre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public DateTime DateGeneration { get; set; }
        public decimal RevenusTotal { get; set; }
        public decimal DepensesTotal { get; set; }
        public decimal Profit { get; set; }
        public decimal TauxCroissance { get; set; }
        public string Contenu { get; set; } = string.Empty;
        public string Type { get; set; } = "Mensuel";
        public string Statut { get; set; } = "Genere";
        public DateTime DateCreation { get; set; }
        public DateTime DateModification { get; set; }
    }

    public class CreateFinancialReportRequest
    {
        [Required]
        public string Titre { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime DateDebut { get; set; }

        [Required]
        public DateTime DateFin { get; set; }

        public decimal RevenusTotal { get; set; } = 0;
        public decimal DepensesTotal { get; set; } = 0;
        public decimal Profit { get; set; } = 0;
        public decimal TauxCroissance { get; set; } = 0;

        public string Contenu { get; set; } = string.Empty;

        public string Type { get; set; } = "Mensuel";
        public string Statut { get; set; } = "Genere";
    }

    public class UpdateFinancialReportRequest : CreateFinancialReportRequest
    {
        public int Id { get; set; }
    }
}