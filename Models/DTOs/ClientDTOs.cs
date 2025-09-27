using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
	public class ClientDTO
	{
		public int Id { get; set; }
		public string Nom { get; set; }
		public string Prenom { get; set; }
		public string NomComplet { get; set; }
		public string RaisonSociale { get; set; }
		public string TypeClient { get; set; }
		public string ICE { get; set; }
		public string Adresse { get; set; }
		public string Ville { get; set; }
		public string CodePostal { get; set; }
		public string Pays { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
		public string Classification { get; set; }
		public decimal LimiteCredit { get; set; }
		public decimal SoldeActuel { get; set; }
		public bool EstActif { get; set; }
		public DateTime DateCreation { get; set; }
		public List<ContactClientDTO> Contacts { get; set; } = new();
	}

	public class ContactClientDTO
	{
		public int Id { get; set; }
		public string Nom { get; set; }
		public string Poste { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
		public string Role { get; set; }
	}

	public class CreateClientRequest
	{
		public string Nom { get; set; }
		public string Prenom { get; set; }
		public string RaisonSociale { get; set; }
		public string TypeClient { get; set; }
		public string ICE { get; set; }
		public string Adresse { get; set; }
		public string Ville { get; set; }
		public string CodePostal { get; set; }
		public string Pays { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
		public string Classification { get; set; }
		public decimal LimiteCredit { get; set; }
		public bool EstActif { get; set; }
	}

	public class UpdateClientRequest : CreateClientRequest
	{
		public int Id { get; set; }
	}

	public class ClientSearchRequest
	{
		public string? SearchTerm { get; set; }
		public string? TypeClient { get; set; }
		public string? Classification { get; set; }
		public string? Ville { get; set; }
		public bool? EstActif { get; set; }
		public decimal? CreditMin { get; set; }
		public decimal? CreditMax { get; set; }
		public DateTime? DateCreationFrom { get; set; }
		public DateTime? DateCreationTo { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public string SortBy { get; set; }
		public string SortDirection { get; set; }
	}

	public class ClientListResponse
	{
		public List<ClientDTO> Clients { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
	}

	public class ClientStatsResponse
	{
		public int TotalClients { get; set; }
		public int ActiveClients { get; set; }
		public int InactiveClients { get; set; }
		public Dictionary<string, int> ClientsByType { get; set; } = new();
		public Dictionary<string, int> ClientsByClassification { get; set; } = new();
		public Dictionary<string, int> ClientsByCity { get; set; } = new();
		public decimal AverageCreditLimit { get; set; }
		public int NewClientsThisMonth { get; set; }
		public int NewClientsThisYear { get; set; }
	}

	public class ClientApiResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; }
		public T? Data { get; set; }
		public DateTime Timestamp { get; set; } = DateTime.UtcNow;
	}

	public class CreateContactClientRequest
	{
		public int ClientId { get; set; }
		public string Nom { get; set; }
		public string Poste { get; set; }
		public string Telephone { get; set; }
		public string Email { get; set; }
		public string Role { get; set; }
	}

	public class UpdateContactClientRequest : CreateContactClientRequest
	{
		public int Id { get; set; }
	}

	public class PaiementClientDTO
	{
		public int Id { get; set; }
		public int FactureId { get; set; }
		public FactureVenteDTO Facture { get; set; }
		public int ClientId { get; set; }
		public ClientDTO Client { get; set; }
		public DateTime DatePaiement { get; set; }
		public decimal Montant { get; set; }
		public string MethodePaiement { get; set; }
		public string Reference { get; set; }
		public string Statut { get; set; }
	}
}


