using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
    // Reglement
    public class ReglementDTO
    {
        public int Id { get; set; }
        public string Nature { get; set; }
        public string Numero { get; set; }
        public decimal Montant { get; set; }
        public DateTime Date { get; set; }
        public string? Banque { get; set; }
        public DateTime? DateEcheance { get; set; }
        public string Type { get; set; } // Fournisseur or Client
        public int? FournisseurId { get; set; }
        public int? ClientId { get; set; }
        public int? CommandeAchatId { get; set; }
        public int? CommandeVenteId { get; set; }
    }

    public class CreateReglementRequest
    {
        public string Nature { get; set; }
        public string Numero { get; set; }
        public decimal Montant { get; set; }
        public DateTime Date { get; set; }
        public string? Banque { get; set; }
        public DateTime? DateEcheance { get; set; }
        public string Type { get; set; }
        public int? FournisseurId { get; set; }
        public int? ClientId { get; set; }
        public int? CommandeAchatId { get; set; }
        public int? CommandeVenteId { get; set; }
    }

    public class UpdateReglementRequest : CreateReglementRequest
    {
        public int Id { get; set; }
    }

    // Journal
    public class JournalDTO
    {
        public int Id { get; set; }
        public string Reference { get; set; }
        public DateTime Date { get; set; }
        public decimal Montant { get; set; }
        public string Type { get; set; }
        public int? FournisseurId { get; set; }
        public int? ClientId { get; set; }
        public int ReglementId { get; set; }
        public string Description { get; set; }
    }

    public class JournalSearchRequest
    {
        public string? Type { get; set; } // Fournisseur/Client
        public int? OwnerId { get; set; } // ClientId or FournisseurId depending on Type
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string SortBy { get; set; } = "date";
        public string SortDirection { get; set; } = "desc";
    }

    // Accounting Entry
    public class AccountingEntryDTO
    {
        public int Id { get; set; }
        public int JournalId { get; set; }
        public string CompteDebit { get; set; }
        public string CompteCredit { get; set; }
        public decimal Montant { get; set; }
        public DateTime Date { get; set; }
    }
}


