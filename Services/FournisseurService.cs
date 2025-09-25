using System;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
	public class FournisseurService
	{
		private readonly IFournisseurDAO _dao;

		public FournisseurService(IFournisseurDAO dao)
		{
			_dao = dao;
		}

		public async Task<FournisseurApiResponse<FournisseurListResponse>> GetAllAsync(int page, int pageSize)
		{
			var (items, total) = await _dao.GetAllAsync(page, pageSize);
			var dtos = items.Select(MapToDTO).ToList();
			return Success(new FournisseurListResponse
			{
				Fournisseurs = dtos,
				TotalCount = total,
				Page = page,
				PageSize = pageSize,
				TotalPages = (int)Math.Ceiling(total / (double)pageSize),
				HasNextPage = page * pageSize < total,
				HasPreviousPage = page > 1
			});
		}

		public async Task<FournisseurApiResponse<FournisseurListResponse>> SearchAsync(FournisseurSearchRequest request)
		{
			var (items, total) = await _dao.SearchAsync(
				request.SearchTerm,
				request.TypeFournisseur,
				request.Ville,
				request.ConditionsPaiement,
				request.DelaiLivraisonMin,
				request.DelaiLivraisonMax,
				request.NoteQualiteMin,
				request.NoteQualiteMax,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new FournisseurListResponse
			{
				Fournisseurs = dtos,
				TotalCount = total,
				Page = request.Page,
				PageSize = request.PageSize,
				TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
				HasNextPage = request.Page * request.PageSize < total,
				HasPreviousPage = request.Page > 1
			});
		}

		public async Task<FournisseurApiResponse<FournisseurDTO>> GetByIdAsync(int id)
		{
			var f = await _dao.GetByIdAsync(id);
			if (f == null) return Failure<FournisseurDTO>("Fournisseur introuvable");
			return Success(MapToDTO(f));
		}

		public async Task<FournisseurApiResponse<FournisseurDTO>> CreateAsync(CreateFournisseurRequest request)
		{
			var entity = new Fournisseur
			{
				RaisonSociale = request.RaisonSociale,
				TypeFournisseur = request.TypeFournisseur,
				ICE = request.ICE,
				Adresse = request.Adresse,
				Ville = request.Ville,
				CodePostal = request.CodePostal,
				Pays = request.Pays,
				Telephone = request.Telephone,
				Email = request.Email,
				ConditionsPaiement = request.ConditionsPaiement,
				DelaiLivraisonMoyen = request.DelaiLivraisonMoyen,
				NoteQualite = request.NoteQualite
			};
			var created = await _dao.CreateAsync(entity);
			return Success(MapToDTO(created));
		}

		public async Task<FournisseurApiResponse<FournisseurDTO>> UpdateAsync(int id, UpdateFournisseurRequest request)
		{
			var existing = await _dao.GetByIdAsync(id);
			if (existing == null) return Failure<FournisseurDTO>("Fournisseur introuvable");

			existing.RaisonSociale = request.RaisonSociale;
			existing.TypeFournisseur = request.TypeFournisseur;
			existing.ICE = request.ICE;
			existing.Adresse = request.Adresse;
			existing.Ville = request.Ville;
			existing.CodePostal = request.CodePostal;
			existing.Pays = request.Pays;
			existing.Telephone = request.Telephone;
			existing.Email = request.Email;
			existing.ConditionsPaiement = request.ConditionsPaiement;
			existing.DelaiLivraisonMoyen = request.DelaiLivraisonMoyen;
			existing.NoteQualite = request.NoteQualite;

			var updated = await _dao.UpdateAsync(existing);
			return Success(MapToDTO(updated));
		}

		public async Task<FournisseurApiResponse<bool>> DeleteAsync(int id)
		{
			var ok = await _dao.DeleteAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<FournisseurApiResponse<ContactFournisseurDTO>> CreateContactAsync(int fournisseurId, CreateContactFournisseurRequest request)
		{
			var entity = new ContactFournisseur
			{
				Nom = request.Nom,
				Poste = request.Poste,
				Telephone = request.Telephone,
				Email = request.Email
			};
			var created = await _dao.CreateContactAsync(fournisseurId, entity);
			return Success(MapToDTO(created));
		}

		public async Task<FournisseurApiResponse<ContactFournisseurDTO>> UpdateContactAsync(UpdateContactFournisseurRequest request)
		{
			var entity = new ContactFournisseur
			{
				Id = request.Id,
				Nom = request.Nom,
				Poste = request.Poste,
				Telephone = request.Telephone,
				Email = request.Email
			};
			var updated = await _dao.UpdateContactAsync(entity);
			if (updated == null) return Failure<ContactFournisseurDTO>("Contact introuvable");
			return Success(MapToDTO(updated));
		}

		public async Task<FournisseurApiResponse<bool>> DeleteContactAsync(int id)
		{
			var ok = await _dao.DeleteContactAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<FournisseurApiResponse<FournisseurStatsResponse>> GetStatsAsync()
		{
			var (items, _) = await _dao.GetAllAsync(1, int.MaxValue);
			var list = items.ToList();
			var stats = new FournisseurStatsResponse
			{
				TotalFournisseurs = list.Count,
				FournisseursParType = list.GroupBy(f => f.TypeFournisseur).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				FournisseursParVille = list.GroupBy(f => f.Ville).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				NoteQualiteMoyenne = list.Any() ? list.Average(f => f.NoteQualite) : 0,
				DelaiLivraisonMoyenGlobal = list.Any() ? (int)Math.Round(list.Average(f => f.DelaiLivraisonMoyen)) : 0
			};
			return Success(stats);
		}

		public Task<System.Collections.Generic.List<string>> GetTypesAsync()
		{
			var names = System.Enum.GetNames(typeof(SupplierType)).ToList();
			return Task.FromResult(names);
		}
		public Task<System.Collections.Generic.List<string>> GetVillesAsync() => _dao.GetVillesAsync();
		public Task<System.Collections.Generic.List<string>> GetConditionsPaiementAsync() => _dao.GetConditionsPaiementAsync();

		private static FournisseurDTO MapToDTO(Fournisseur f)
		{
			return new FournisseurDTO
			{
				Id = f.Id,
				RaisonSociale = f.RaisonSociale,
				TypeFournisseur = f.TypeFournisseur,
				ICE = f.ICE,
				Adresse = f.Adresse,
				Ville = f.Ville,
				CodePostal = f.CodePostal,
				Pays = f.Pays,
				Telephone = f.Telephone,
				Email = f.Email,
				ConditionsPaiement = f.ConditionsPaiement,
				DelaiLivraisonMoyen = f.DelaiLivraisonMoyen,
				NoteQualite = f.NoteQualite,
				Contacts = f.Contacts.Select(MapToDTO).ToList()
			};
		}

		private static ContactFournisseurDTO MapToDTO(ContactFournisseur c)
		{
			return new ContactFournisseurDTO
			{
				Id = c.Id,
				Nom = c.Nom,
				Poste = c.Poste,
				Telephone = c.Telephone,
				Email = c.Email
			};
		}

		private static FournisseurApiResponse<T> Success<T>(T data)
		{
			return new FournisseurApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow };
		}

		private static FournisseurApiResponse<T> Failure<T>(string message)
		{
			return new FournisseurApiResponse<T> { Success = false, Message = message, Data = default, Timestamp = DateTime.UtcNow };
		}
	}
}


