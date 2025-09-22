using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
	public class ClientService
	{
		private readonly IClientDAO _dao;

		public ClientService(IClientDAO dao)
		{
			_dao = dao;
		}

		public async Task<ClientApiResponse<ClientListResponse>> GetAllAsync(int page, int pageSize)
		{
			var (items, total) = await _dao.GetAllAsync(page, pageSize);
			var dtos = items.Select(MapToDTO).ToList();
			return Success(new ClientListResponse
			{
				Clients = dtos,
				TotalCount = total,
				Page = page,
				PageSize = pageSize,
				TotalPages = (int)Math.Ceiling(total / (double)pageSize),
				HasNextPage = page * pageSize < total,
				HasPreviousPage = page > 1
			});
		}

		public async Task<ClientApiResponse<ClientListResponse>> SearchAsync(ClientSearchRequest request)
		{
			var (items, total) = await _dao.SearchAsync(
				request.SearchTerm,
				request.TypeClient,
				request.Classification,
				request.Ville,
				request.EstActif,
				request.CreditMin,
				request.CreditMax,
				request.DateCreationFrom,
				request.DateCreationTo,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new ClientListResponse
			{
				Clients = dtos,
				TotalCount = total,
				Page = request.Page,
				PageSize = request.PageSize,
				TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
				HasNextPage = request.Page * request.PageSize < total,
				HasPreviousPage = request.Page > 1
			});
		}

		public async Task<ClientApiResponse<ClientDTO>> GetByIdAsync(int id)
		{
			var c = await _dao.GetByIdAsync(id);
			if (c == null) return Failure<ClientDTO>("Client introuvable");
			return Success(MapToDTO(c));
		}

		public async Task<ClientApiResponse<ClientDTO>> CreateAsync(CreateClientRequest request)
		{
			var entity = new Client
			{
				Nom = request.Nom,
				Prenom = request.Prenom,
				RaisonSociale = request.RaisonSociale,
				TypeClient = request.TypeClient,
				ICE = request.ICE,
				Adresse = request.Adresse,
				Ville = request.Ville,
				CodePostal = request.CodePostal,
				Pays = request.Pays,
				Telephone = request.Telephone,
				Email = request.Email,
				Classification = request.Classification,
				LimiteCredit = request.LimiteCredit,
				EstActif = request.EstActif,
				DateCreation = DateTime.Now
			};
			var created = await _dao.CreateAsync(entity);
			return Success(MapToDTO(created));
		}

		public async Task<ClientApiResponse<ClientDTO>> UpdateAsync(int id, UpdateClientRequest request)
		{
			var existing = await _dao.GetByIdAsync(id);
			if (existing == null) return Failure<ClientDTO>("Client introuvable");

			existing.Nom = request.Nom;
			existing.Prenom = request.Prenom;
			existing.RaisonSociale = request.RaisonSociale;
			existing.TypeClient = request.TypeClient;
			existing.ICE = request.ICE;
			existing.Adresse = request.Adresse;
			existing.Ville = request.Ville;
			existing.CodePostal = request.CodePostal;
			existing.Pays = request.Pays;
			existing.Telephone = request.Telephone;
			existing.Email = request.Email;
			existing.Classification = request.Classification;
			existing.LimiteCredit = request.LimiteCredit;
			existing.EstActif = request.EstActif;

			var updated = await _dao.UpdateAsync(existing);
			return Success(MapToDTO(updated));
		}

		public async Task<ClientApiResponse<bool>> DeleteAsync(int id)
		{
			var ok = await _dao.DeleteAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<ClientApiResponse<ContactClientDTO>> CreateContactAsync(int clientId, CreateContactClientRequest request)
		{
			var entity = new ContactClient
			{
				Nom = request.Nom,
				Poste = request.Poste,
				Telephone = request.Telephone,
				Email = request.Email,
				Role = request.Role
			};
			var created = await _dao.CreateContactAsync(clientId, entity);
			return Success(MapToDTO(created));
		}

		public async Task<ClientApiResponse<ContactClientDTO>> UpdateContactAsync(UpdateContactClientRequest request)
		{
			var entity = new ContactClient
			{
				Id = request.Id,
				Nom = request.Nom,
				Poste = request.Poste,
				Telephone = request.Telephone,
				Email = request.Email,
				Role = request.Role
			};
			var updated = await _dao.UpdateContactAsync(entity);
			if (updated == null) return Failure<ContactClientDTO>("Contact introuvable");
			return Success(MapToDTO(updated));
		}

		public async Task<ClientApiResponse<bool>> DeleteContactAsync(int id)
		{
			var ok = await _dao.DeleteContactAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<ClientApiResponse<ClientStatsResponse>> GetStatsAsync()
		{
			var (items, _) = await _dao.GetAllAsync(1, int.MaxValue);
			var list = items.ToList();
			var stats = new ClientStatsResponse
			{
				TotalClients = list.Count,
				ActiveClients = list.Count(c => c.EstActif),
				InactiveClients = list.Count(c => !c.EstActif),
				ClientsByType = list.GroupBy(c => c.TypeClient).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				ClientsByClassification = list.GroupBy(c => c.Classification).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				ClientsByCity = list.GroupBy(c => c.Ville).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				AverageCreditLimit = list.Any() ? list.Average(c => c.LimiteCredit) : 0,
				NewClientsThisMonth = list.Count(c => c.DateCreation.Year == DateTime.Now.Year && c.DateCreation.Month == DateTime.Now.Month),
				NewClientsThisYear = list.Count(c => c.DateCreation.Year == DateTime.Now.Year)
			};
			return Success(stats);
		}

		public Task<System.Collections.Generic.List<string>> GetClientTypesAsync() => _dao.GetClientTypesAsync();
		public Task<System.Collections.Generic.List<string>> GetClassificationsAsync() => _dao.GetClassificationsAsync();
		public Task<System.Collections.Generic.List<string>> GetCitiesAsync() => _dao.GetCitiesAsync();

		private static ClientDTO MapToDTO(Client c)
		{
			return new ClientDTO
			{
				Id = c.Id,
				Nom = c.Nom,
				Prenom = c.Prenom,
				NomComplet = ($"{c.Prenom} {c.Nom}").Trim(),
				RaisonSociale = c.RaisonSociale,
				TypeClient = c.TypeClient,
				ICE = c.ICE,
				Adresse = c.Adresse,
				Ville = c.Ville,
				CodePostal = c.CodePostal,
				Pays = c.Pays,
				Telephone = c.Telephone,
				Email = c.Email,
				Classification = c.Classification,
				LimiteCredit = c.LimiteCredit,
				SoldeActuel = c.SoldeActuel,
				EstActif = c.EstActif,
				DateCreation = c.DateCreation,
				Contacts = c.Contacts.Select(MapToDTO).ToList()
			};
		}

		private static ContactClientDTO MapToDTO(ContactClient cc)
		{
			return new ContactClientDTO
			{
				Id = cc.Id,
				Nom = cc.Nom,
				Poste = cc.Poste,
				Telephone = cc.Telephone,
				Email = cc.Email,
				Role = cc.Role
			};
		}

		private static ClientApiResponse<T> Success<T>(T data)
		{
			return new ClientApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow };
		}

		private static ClientApiResponse<T> Failure<T>(string message)
		{
			return new ClientApiResponse<T> { Success = false, Message = message, Data = default, Timestamp = DateTime.UtcNow };
		}
	}
}


