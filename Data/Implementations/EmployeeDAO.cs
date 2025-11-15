using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
	public class EmployeeDAO : IEmployeeDAO
	{
		private readonly ApplicationDbContext _db;

		public EmployeeDAO(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<(IEnumerable<Employe> Items, int TotalCount)> GetAllAsync(int page, int pageSize, string? searchTerm)
		{
			var query = _db.Employes.AsQueryable();

			if (!string.IsNullOrWhiteSpace(searchTerm))
			{
				var term = searchTerm.Trim().ToLower();
				query = query.Where(e =>
					EF.Functions.Like(e.Nom.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.Prenom.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.CIN.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.Poste.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.Departement.ToLower(), $"%{term}%")
				);
			}

			var total = await query.CountAsync();
			var items = await query
				.OrderBy(e => e.Nom)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();

			return (items, total);
		}

		public async Task<(IEnumerable<Employe> Items, int TotalCount)> SearchAsync(string? searchTerm, string? departement, string? poste, string? statut, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize, string sortBy, string sortDirection)
		{
			var query = _db.Employes.AsQueryable();

			if (!string.IsNullOrWhiteSpace(searchTerm))
			{
				var term = searchTerm.Trim().ToLower();
				query = query.Where(e =>
					EF.Functions.Like(e.Nom.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.Prenom.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.CIN.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.Poste.ToLower(), $"%{term}%") ||
					EF.Functions.Like(e.Departement.ToLower(), $"%{term}%")
				);
			}
			if (!string.IsNullOrWhiteSpace(departement)) query = query.Where(e => e.Departement == departement);
			if (!string.IsNullOrWhiteSpace(poste)) query = query.Where(e => e.Poste == poste);
			if (!string.IsNullOrWhiteSpace(statut)) query = query.Where(e => e.Statut == statut);
			if (dateFrom.HasValue) query = query.Where(e => e.DateEmbauche >= dateFrom.Value);
			if (dateTo.HasValue) query = query.Where(e => e.DateEmbauche <= dateTo.Value);

			// Sorting
			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "nom":
					query = desc ? query.OrderByDescending(e => e.Nom) : query.OrderBy(e => e.Nom);
					break;
				case "departement":
					query = desc ? query.OrderByDescending(e => e.Departement) : query.OrderBy(e => e.Departement);
					break;
				case "poste":
					query = desc ? query.OrderByDescending(e => e.Poste) : query.OrderBy(e => e.Poste);
					break;
				case "dateembauche":
					query = desc ? query.OrderByDescending(e => e.DateEmbauche) : query.OrderBy(e => e.DateEmbauche);
					break;
				default:
					query = query.OrderBy(e => e.Nom);
					break;
			}

			var total = await query.CountAsync();
			var items = await query
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();

			return (items, total);
		}

		public Task<Employe?> GetByIdAsync(int id)
		{
			return _db.Employes.FirstOrDefaultAsync(e => e.Id == id);
		}

		public async Task<Employe> CreateAsync(Employe entity)
		{
			_db.Employes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Employe> UpdateAsync(Employe entity)
		{
			_db.Employes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteAsync(int id)
		{
			var e = await _db.Employes.FindAsync(id);
			if (e == null) return false;
			_db.Employes.Remove(e);
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<bool> UpdateStatusAsync(int id, string newStatus)
		{
			var e = await _db.Employes.FindAsync(id);
			if (e == null) return false;
			e.Statut = newStatus;
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<List<string>> GetDepartmentsAsync()
		{
			return await _db.Employes
				.Select(e => e.Departement)
				.Where(s => !string.IsNullOrEmpty(s))
				.Distinct()
				.OrderBy(s => s)
				.ToListAsync();
		}

		public async Task<List<string>> GetPositionsAsync()
		{
			return await _db.Employes
				.Select(e => e.Poste)
				.Where(s => !string.IsNullOrEmpty(s))
				.Distinct()
				.OrderBy(s => s)
				.ToListAsync();
		}

		public async Task<List<string>> GetStatusesAsync()
		{
			return await _db.Employes
				.Select(e => e.Statut)
				.Where(s => !string.IsNullOrEmpty(s))
				.Distinct()
				.OrderBy(s => s)
				.ToListAsync();
		}

		public async Task<bool> IsCinAvailableAsync(string cin)
		{
			return !await _db.Employes.AnyAsync(e => e.CIN == cin);
		}
	}
}