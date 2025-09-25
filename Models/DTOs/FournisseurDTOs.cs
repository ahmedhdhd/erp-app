using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
	public class FournisseurDTO
	{
		public int Id { get; set; }
		public string RaisonSociale { get; set; }
		public string TypeFournisseur { get; set; }
		public string ICE { get; set; }
		public string Adresse { get; set; }
		public string Ville { get; set; }
		public string CodePostal { get; set; }
		public string Pays { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
		public string ConditionsPaiement { get; set; }
		public int DelaiLivraisonMoyen { get; set; }
		public decimal NoteQualite { get; set; }
		public List<ContactFournisseurDTO> Contacts { get; set; } = new();
	}

	public class ContactFournisseurDTO
	{
		public int Id { get; set; }
		public string Nom { get; set; }
		public string Poste { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
	}

	public class CreateFournisseurRequest
	{
		public string RaisonSociale { get; set; }
		public string TypeFournisseur { get; set; }
		public string ICE { get; set; }
		public string Adresse { get; set; }
		public string Ville { get; set; }
		public string CodePostal { get; set; }
		public string Pays { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
		public string ConditionsPaiement { get; set; }
		public int DelaiLivraisonMoyen { get; set; }
		public decimal NoteQualite { get; set; }
	}

	public class UpdateFournisseurRequest : CreateFournisseurRequest
	{
		public int Id { get; set; }
	}

	public class FournisseurSearchRequest
	{
		public string? SearchTerm { get; set; }
		public string? TypeFournisseur { get; set; }
		public string? Ville { get; set; }
		public string? ConditionsPaiement { get; set; }
		public int? DelaiLivraisonMin { get; set; }
		public int? DelaiLivraisonMax { get; set; }
		public decimal? NoteQualiteMin { get; set; }
		public decimal? NoteQualiteMax { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public string SortBy { get; set; }
		public string SortDirection { get; set; }
	}

	public class FournisseurListResponse
	{
		public List<FournisseurDTO> Fournisseurs { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
	}

	public class FournisseurStatsResponse
	{
		public int TotalFournisseurs { get; set; }
		public Dictionary<string, int> FournisseursParType { get; set; } = new();
		public Dictionary<string, int> FournisseursParVille { get; set; } = new();
		public decimal NoteQualiteMoyenne { get; set; }
		public int DelaiLivraisonMoyenGlobal { get; set; }
	}

	public class FournisseurApiResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; }
		public T? Data { get; set; }
		public DateTime Timestamp { get; set; } = DateTime.UtcNow;
	}

	public class CreateContactFournisseurRequest
	{
		public int FournisseurId { get; set; }
		public string Nom { get; set; }
		public string Poste { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
	}

	public class UpdateContactFournisseurRequest : CreateContactFournisseurRequest
	{
		public int Id { get; set; }
	}
}



