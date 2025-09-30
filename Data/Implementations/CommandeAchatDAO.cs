using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
	public class CommandeAchatDAO : ICommandeAchatDAO
	{
		private readonly ApplicationDbContext _db;

		public CommandeAchatDAO(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<(IEnumerable<CommandeAchat> Items, int TotalCount)> GetAllAsync(int page, int pageSize)
		{
			var query = _db.CommandeAchats
				.Include(c => c.Fournisseur)
				.Include(c => c.Lignes)
					.ThenInclude(l => l.Produit)
				.AsQueryable();
				
			var total = await query.CountAsync();
			var items = await query
				.OrderByDescending(c => c.DateCommande)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();
				
			return (items, total);
		}

		public Task<CommandeAchat?> GetByIdAsync(int id)
		{
			return _db.CommandeAchats
				.Include(c => c.Fournisseur)
				.Include(c => c.Lignes)
					.ThenInclude(l => l.Produit)
				.Include(c => c.Receptions)
					.ThenInclude(r => r.Lignes)
				.Include(c => c.Factures)
				.FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task<CommandeAchat> CreateAsync(CommandeAchat entity)
		{
			_db.CommandeAchats.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<CommandeAchat> UpdateAsync(CommandeAchat entity)
		{
			// Debug.WriteLine($"CommandeAchatDAO.UpdateAsync called for commande {entity.Id} with status {entity.Statut}");
			_db.CommandeAchats.Update(entity);
			var result = await _db.SaveChangesAsync();
			// Debug.WriteLine($"CommandeAchatDAO.UpdateAsync saved {result} changes for commande {entity.Id}");
			return entity;
		}

		public async Task<bool> DeleteAsync(int id)
		{
			var entity = await _db.CommandeAchats.FindAsync(id);
			if (entity == null) return false;
			_db.CommandeAchats.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
		
		// LigneCommandeAchat operations
		public async Task<LigneCommandeAchat> CreateLigneAsync(LigneCommandeAchat entity)
		{
			_db.LigneCommandeAchats.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneCommandeAchat?> UpdateLigneAsync(LigneCommandeAchat entity)
		{
			if (!await _db.LigneCommandeAchats.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneCommandeAchats.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneAsync(int id)
		{
			var entity = await _db.LigneCommandeAchats.FindAsync(id);
			if (entity == null) return false;
			_db.LigneCommandeAchats.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
		
		// Reception operations
		public async Task<Reception> CreateReceptionAsync(Reception entity)
		{
			_db.Receptions.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Reception?> UpdateReceptionAsync(Reception entity)
		{
			if (!await _db.Receptions.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.Receptions.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteReceptionAsync(int id)
		{
			var entity = await _db.Receptions.FindAsync(id);
			if (entity == null) return false;
			_db.Receptions.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
		
		// LigneReception operations
		public async Task<LigneReception> CreateLigneReceptionAsync(LigneReception entity)
		{
			_db.LigneReceptions.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneReception?> UpdateLigneReceptionAsync(LigneReception entity)
		{
			if (!await _db.LigneReceptions.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneReceptions.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneReceptionAsync(int id)
		{
			var entity = await _db.LigneReceptions.FindAsync(id);
			if (entity == null) return false;
			_db.LigneReceptions.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
		
		// FactureAchat operations
		public async Task<FactureAchat> CreateFactureAsync(FactureAchat entity)
		{
			_db.FactureAchats.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<FactureAchat?> UpdateFactureAsync(FactureAchat entity)
		{
			if (!await _db.FactureAchats.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.FactureAchats.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteFactureAsync(int id)
		{
			var entity = await _db.FactureAchats.FindAsync(id);
			if (entity == null) return false;
			_db.FactureAchats.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
		
		// LigneFactureAchat operations
		public async Task<LigneFactureAchat> CreateLigneFactureAsync(LigneFactureAchat entity)
		{
			_db.LigneFactureAchats.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneFactureAchat?> UpdateLigneFactureAsync(LigneFactureAchat entity)
		{
			if (!await _db.LigneFactureAchats.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneFactureAchats.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneFactureAsync(int id)
		{
			var entity = await _db.LigneFactureAchats.FindAsync(id);
			if (entity == null) return false;
			_db.LigneFactureAchats.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
		
		public async Task<(IEnumerable<CommandeAchat> Items, int TotalCount)> SearchAsync(
			int? fournisseurId,
			string? statut,
			DateTime? dateDebut,
			DateTime? dateFin,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection)
		{
			var query = _db.CommandeAchats
				.Include(c => c.Fournisseur)
				.Include(c => c.Lignes)
					.ThenInclude(l => l.Produit)
				.AsQueryable();

			if (fournisseurId.HasValue) query = query.Where(c => c.FournisseurId == fournisseurId.Value);
			if (!string.IsNullOrWhiteSpace(statut)) query = query.Where(c => c.Statut == statut);
			if (dateDebut.HasValue) query = query.Where(c => c.DateCommande >= dateDebut.Value);
			if (dateFin.HasValue) query = query.Where(c => c.DateCommande <= dateFin.Value);

			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "datecommande": query = desc ? query.OrderByDescending(c => c.DateCommande) : query.OrderBy(c => c.DateCommande); break;
				case "fournisseurid": query = desc ? query.OrderByDescending(c => c.FournisseurId) : query.OrderBy(c => c.FournisseurId); break;
				case "statut": query = desc ? query.OrderByDescending(c => c.Statut) : query.OrderBy(c => c.Statut); break;
				case "montantht": query = desc ? query.OrderByDescending(c => c.MontantHT) : query.OrderBy(c => c.MontantHT); break;
				default: query = query.OrderByDescending(c => c.DateCommande); break;
			}

			var total = await query.CountAsync();
			var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
			return (items, total);
		}
	}
}