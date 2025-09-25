using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
	public class FournisseurDAO : IFournisseurDAO
	{
		private readonly ApplicationDbContext _db;

		public FournisseurDAO(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<(IEnumerable<Fournisseur> Items, int TotalCount)> GetAllAsync(int page, int pageSize)
		{
			var query = _db.Fournisseurs.Include(f => f.Contacts).AsQueryable();
			var total = await query.CountAsync();
			var items = await query
				.OrderBy(f => f.RaisonSociale)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();
			return (items, total);
		}

		public async Task<(IEnumerable<Fournisseur> Items, int TotalCount)> SearchAsync(
			string? searchTerm,
			string? typeFournisseur,
			string? ville,
			string? conditionsPaiement,
			int? delaiLivraisonMin,
			int? delaiLivraisonMax,
			decimal? noteQualiteMin,
			decimal? noteQualiteMax,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection)
		{
			var query = _db.Fournisseurs.Include(f => f.Contacts).AsQueryable();

			if (!string.IsNullOrWhiteSpace(searchTerm))
			{
				var term = searchTerm.Trim().ToLower();
				query = query.Where(f =>
					EF.Functions.Like(f.RaisonSociale.ToLower(), $"%{term}%") ||
					EF.Functions.Like(f.ICE.ToLower(), $"%{term}%") ||
					EF.Functions.Like(f.Ville.ToLower(), $"%{term}%")
				);
			}
			if (!string.IsNullOrWhiteSpace(typeFournisseur)) query = query.Where(f => f.TypeFournisseur == typeFournisseur);
			if (!string.IsNullOrWhiteSpace(ville)) query = query.Where(f => f.Ville == ville);
			if (!string.IsNullOrWhiteSpace(conditionsPaiement)) query = query.Where(f => f.ConditionsPaiement == conditionsPaiement);
			if (delaiLivraisonMin.HasValue) query = query.Where(f => f.DelaiLivraisonMoyen >= delaiLivraisonMin.Value);
			if (delaiLivraisonMax.HasValue) query = query.Where(f => f.DelaiLivraisonMoyen <= delaiLivraisonMax.Value);
			if (noteQualiteMin.HasValue) query = query.Where(f => f.NoteQualite >= noteQualiteMin.Value);
			if (noteQualiteMax.HasValue) query = query.Where(f => f.NoteQualite <= noteQualiteMax.Value);

			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "raisonsociale": query = desc ? query.OrderByDescending(f => f.RaisonSociale) : query.OrderBy(f => f.RaisonSociale); break;
				case "ville": query = desc ? query.OrderByDescending(f => f.Ville) : query.OrderBy(f => f.Ville); break;
				case "notequalite": query = desc ? query.OrderByDescending(f => f.NoteQualite) : query.OrderBy(f => f.NoteQualite); break;
				default: query = query.OrderBy(f => f.RaisonSociale); break;
			}

			var total = await query.CountAsync();
			var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
			return (items, total);
		}

		public Task<Fournisseur?> GetByIdAsync(int id)
		{
			return _db.Fournisseurs.Include(f => f.Contacts).FirstOrDefaultAsync(f => f.Id == id);
		}

		public async Task<Fournisseur> CreateAsync(Fournisseur entity)
		{
			_db.Fournisseurs.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Fournisseur> UpdateAsync(Fournisseur entity)
		{
			_db.Fournisseurs.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteAsync(int id)
		{
			var e = await _db.Fournisseurs.FindAsync(id);
			if (e == null) return false;
			_db.Fournisseurs.Remove(e);
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<ContactFournisseur> CreateContactAsync(int fournisseurId, ContactFournisseur contact)
		{
			contact.GetType();
			_db.ContactFournisseurs.Add(contact);
			await _db.SaveChangesAsync();
			return contact;
		}

		public async Task<ContactFournisseur?> UpdateContactAsync(ContactFournisseur contact)
		{
			if (!await _db.ContactFournisseurs.AnyAsync(x => x.Id == contact.Id)) return null;
			_db.ContactFournisseurs.Update(contact);
			await _db.SaveChangesAsync();
			return contact;
		}

		public async Task<bool> DeleteContactAsync(int contactId)
		{
			var c = await _db.ContactFournisseurs.FindAsync(contactId);
			if (c == null) return false;
			_db.ContactFournisseurs.Remove(c);
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<List<string>> GetTypesAsync() => await _db.Fournisseurs.Select(f => f.TypeFournisseur).Where(x => x != null && x != "").Distinct().OrderBy(x => x).ToListAsync();
		public async Task<List<string>> GetVillesAsync() => await _db.Fournisseurs.Select(f => f.Ville).Where(x => x != null && x != "").Distinct().OrderBy(x => x).ToListAsync();
		public async Task<List<string>> GetConditionsPaiementAsync() => await _db.Fournisseurs.Select(f => f.ConditionsPaiement).Where(x => x != null && x != "").Distinct().OrderBy(x => x).ToListAsync();
	}
}


