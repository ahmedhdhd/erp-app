using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
    // SituationFamiliale DTOs
    public class SituationFamilialeDTO
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public string EtatCivil { get; set; }
        public bool ChefDeFamille { get; set; }
        public int NombreEnfants { get; set; }
        public int EnfantsEtudiants { get; set; }
        public int EnfantsHandicapes { get; set; }
        public int ParentsACharge { get; set; }
        public bool ConjointACharge { get; set; }
        // Salary information
        public decimal SalaireBase { get; set; }
        public decimal PrimePresence { get; set; }
        public decimal PrimeProduction { get; set; }
        public DateTime DateDerniereMaj { get; set; }
    }

    public class CreateSituationFamilialeRequest
    {
        public int EmployeId { get; set; }
        public string EtatCivil { get; set; }
        public bool ChefDeFamille { get; set; }
        public int NombreEnfants { get; set; }
        public int EnfantsEtudiants { get; set; }
        public int EnfantsHandicapes { get; set; }
        public int ParentsACharge { get; set; }
        public bool ConjointACharge { get; set; }
        // Salary information
        public decimal SalaireBase { get; set; }
        public decimal PrimePresence { get; set; }
        public decimal PrimeProduction { get; set; }
    }

    public class UpdateSituationFamilialeRequest : CreateSituationFamilialeRequest
    {
        public int Id { get; set; }
    }

    // EtatDePaie DTOs
    public class EtatDePaieDTO
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public EmployeeDTO Employe { get; set; }
        public string Mois { get; set; }
        public int NombreDeJours { get; set; }
        public decimal SalaireBase { get; set; }
        public decimal PrimePresence { get; set; }
        public decimal PrimeProduction { get; set; }
        public decimal SalaireBrut { get; set; }
        public decimal CNSS { get; set; }
        public decimal SalaireImposable { get; set; }
        public decimal IRPP { get; set; }
        public decimal CSS { get; set; }
        public decimal SalaireNet { get; set; }
        public DateTime DateCreation { get; set; }
        
        // Family situation information for display
        public string EtatCivil { get; set; }
        public bool ChefDeFamille { get; set; }
        public int NombreEnfants { get; set; }
    }

    public class CreateEtatDePaieRequest
    {
        public int EmployeId { get; set; }
        public string Mois { get; set; }
        public int NombreDeJours { get; set; }
        public decimal SalaireBase { get; set; }
        public decimal PrimePresence { get; set; }
        public decimal PrimeProduction { get; set; }
    }

    public class UpdateEtatDePaieRequest : CreateEtatDePaieRequest
    {
        public int Id { get; set; }
    }

    public class EtatDePaieListResponse
    {
        public List<EtatDePaieDTO> EtatsDePaie { get; set; } = new List<EtatDePaieDTO>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }

    public class EtatDePaieSearchRequest
    {
        public string Mois { get; set; }
        public int? EmployeId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string SortBy { get; set; } = "DateCreation";
        public string SortDirection { get; set; } = "Desc";
    }
}