using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
	public class ClientDAO : IClientDAO
	{
		private readonly ApplicationDbContext _db;

		public ClientDAO(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<(IEnumerable<Client> Items, int TotalCount)> GetAllAsync(int page, int pageSize)
		{
			var query = _db.Clients.Include(c => c.Contacts).AsQueryable();
			var total = await query.CountAsync();
			var items = await query
				.OrderBy(c => c.Nom)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();
			return (items, total);
		}

		public async Task<(IEnumerable<Client> Items, int TotalCount)> SearchAsync(string? searchTerm, string? typeClient, string? classification, string? ville, bool? estActif, decimal? creditMin, decimal? creditMax, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize, string sortBy, string sortDirection)
		{
			var query = _db.Clients.Include(c => c.Contacts).AsQueryable();

			if (!string.IsNullOrWhiteSpace(searchTerm))
			{
				var term = searchTerm.Trim().ToLower();
				query = query.Where(c =>
					EF.Functions.Like(c.Nom.ToLower(), $"%{term}%") ||
					EF.Functions.Like(c.Prenom.ToLower(), $"%{term}%") ||
					EF.Functions.Like(c.RaisonSociale.ToLower(), $"%{term}%") ||
					EF.Functions.Like(c.ICE.ToLower(), $"%{term}%") ||
					EF.Functions.Like(c.Ville.ToLower(), $"%{term}%")
				);
			}
			if (!string.IsNullOrWhiteSpace(typeClient)) query = query.Where(c => c.TypeClient == typeClient);
			if (!string.IsNullOrWhiteSpace(classification)) query = query.Where(c => c.Classification == classification);
			if (!string.IsNullOrWhiteSpace(ville)) query = query.Where(c => c.Ville == ville);
			if (estActif.HasValue) query = query.Where(c => c.EstActif == estActif.Value);
			if (creditMin.HasValue) query = query.Where(c => c.LimiteCredit >= creditMin.Value);
			if (creditMax.HasValue) query = query.Where(c => c.LimiteCredit <= creditMax.Value);
			if (dateFrom.HasValue) query = query.Where(c => c.DateCreation >= dateFrom.Value);
			if (dateTo.HasValue) query = query.Where(c => c.DateCreation <= dateTo.Value);

			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "nom": query = desc ? query.OrderByDescending(c => c.Nom) : query.OrderBy(c => c.Nom); break;
				case "ville": query = desc ? query.OrderByDescending(c => c.Ville) : query.OrderBy(c => c.Ville); break;
				case "datecreation": query = desc ? query.OrderByDescending(c => c.DateCreation) : query.OrderBy(c => c.DateCreation); break;
				default: query = query.OrderBy(c => c.Nom); break;
			}

			var total = await query.CountAsync();
			var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
			return (items, total);
		}

		public Task<Client?> GetByIdAsync(int id)
		{
			return _db.Clients.Include(c => c.Contacts).FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task<Client> CreateAsync(Client entity)
		{
			_db.Clients.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Client> UpdateAsync(Client entity)
		{
			_db.Clients.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteAsync(int id)
		{
			var c = await _db.Clients.FindAsync(id);
			if (c == null) return false;
			_db.Clients.Remove(c);
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<ContactClient> CreateContactAsync(int clientId, ContactClient contact)
		{
			contact.GetType(); // no-op to avoid warnings
			_db.ContactClients.Add(contact);
			await _db.SaveChangesAsync();
			return contact;
		}

		public async Task<ContactClient?> UpdateContactAsync(ContactClient contact)
		{
			if (!await _db.ContactClients.AnyAsync(x => x.Id == contact.Id)) return null;
			_db.ContactClients.Update(contact);
			await _db.SaveChangesAsync();
			return contact;
		}

		public async Task<bool> DeleteContactAsync(int contactId)
		{
			var c = await _db.ContactClients.FindAsync(contactId);
			if (c == null) return false;
			_db.ContactClients.Remove(c);
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<List<string>> GetClientTypesAsync() => await _db.Clients.Select(c => c.TypeClient).Where(x => x != null && x != "").Distinct().OrderBy(x => x).ToListAsync();
		public async Task<List<string>> GetClassificationsAsync() => await _db.Clients.Select(c => c.Classification).Where(x => x != null && x != "").Distinct().OrderBy(x => x).ToListAsync();
		public async Task<List<string>> GetCitiesAsync() => await _db.Clients.Select(c => c.Ville).Where(x => x != null && x != "").Distinct().OrderBy(x => x).ToListAsync();
	}
}


