using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
	public class CommandeVenteDAO : ICommandeVenteDAO
	{
		private readonly ApplicationDbContext _db;

		public CommandeVenteDAO(ApplicationDbContext db)
		{
			_db = db;
		}

		// Sales Order operations
		public async Task<(IEnumerable<CommandeVente> Items, int TotalCount)> GetAllAsync(int page, int pageSize)
		{
			var query = _db.CommandeVentes
				.Include(c => c.Client)
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

		public async Task<(IEnumerable<CommandeVente> Items, int TotalCount)> SearchAsync(
			int? clientId,
			string? statut,
			DateTime? dateDebut,
			DateTime? dateFin,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection)
		{
			var query = _db.CommandeVentes
				.Include(c => c.Client)
				.Include(c => c.Lignes)
					.ThenInclude(l => l.Produit)
				.AsQueryable();

			if (clientId.HasValue) query = query.Where(c => c.ClientId == clientId.Value);
			if (!string.IsNullOrWhiteSpace(statut)) query = query.Where(c => c.Statut == statut);
			if (dateDebut.HasValue) query = query.Where(c => c.DateCommande >= dateDebut.Value);
			if (dateFin.HasValue) query = query.Where(c => c.DateCommande <= dateFin.Value);

			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "datecommande": query = desc ? query.OrderByDescending(c => c.DateCommande) : query.OrderBy(c => c.DateCommande); break;
				case "clientid": query = desc ? query.OrderByDescending(c => c.ClientId) : query.OrderBy(c => c.ClientId); break;
				case "statut": query = desc ? query.OrderByDescending(c => c.Statut) : query.OrderBy(c => c.Statut); break;
				case "montantht": query = desc ? query.OrderByDescending(c => c.MontantHT) : query.OrderBy(c => c.MontantHT); break;
				default: query = query.OrderByDescending(c => c.DateCommande); break;
			}

			var total = await query.CountAsync();
			var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
			return (items, total);
		}

		public Task<CommandeVente?> GetByIdAsync(int id)
		{
			return _db.CommandeVentes
				.Include(c => c.Client)
				.Include(c => c.Lignes)
					.ThenInclude(l => l.Produit)
				.FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task<CommandeVente> CreateAsync(CommandeVente entity)
		{
			_db.CommandeVentes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<CommandeVente> UpdateAsync(CommandeVente entity)
		{
			_db.CommandeVentes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteAsync(int id)
		{
			var entity = await _db.CommandeVentes.FindAsync(id);
			if (entity == null) return false;
			_db.CommandeVentes.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Sales Quote operations
		public async Task<(IEnumerable<Devis> Items, int TotalCount)> GetAllDevisAsync(int page, int pageSize)
		{
			var query = _db.Devis
				.Include(d => d.Client)
				.Include(d => d.Lignes)
					.ThenInclude(l => l.Produit)
				.AsQueryable();

			var total = await query.CountAsync();
			var items = await query
				.OrderByDescending(d => d.DateCreation)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();

			return (items, total);
		}

		public async Task<(IEnumerable<Devis> Items, int TotalCount)> SearchDevisAsync(
			int? clientId,
			string? statut,
			DateTime? dateDebut,
			DateTime? dateFin,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection)
		{
			var query = _db.Devis
				.Include(d => d.Client)
				.Include(d => d.Lignes)
					.ThenInclude(l => l.Produit)
				.AsQueryable();

			if (clientId.HasValue) query = query.Where(d => d.ClientId == clientId.Value);
			if (!string.IsNullOrWhiteSpace(statut)) query = query.Where(d => d.Statut == statut);
			if (dateDebut.HasValue) query = query.Where(d => d.DateCreation >= dateDebut.Value);
			if (dateFin.HasValue) query = query.Where(d => d.DateCreation <= dateFin.Value);

			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "datecreation": query = desc ? query.OrderByDescending(d => d.DateCreation) : query.OrderBy(d => d.DateCreation); break;
				case "clientid": query = desc ? query.OrderByDescending(d => d.ClientId) : query.OrderBy(d => d.ClientId); break;
				case "statut": query = desc ? query.OrderByDescending(d => d.Statut) : query.OrderBy(d => d.Statut); break;
				case "montantht": query = desc ? query.OrderByDescending(d => d.MontantHT) : query.OrderBy(d => d.MontantHT); break;
				default: query = query.OrderByDescending(d => d.DateCreation); break;
			}

			var total = await query.CountAsync();
			var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
			return (items, total);
		}

		public Task<Devis?> GetDevisByIdAsync(int id)
		{
			return _db.Devis
				.Include(d => d.Client)
				.Include(d => d.Lignes)
					.ThenInclude(l => l.Produit)
				.FirstOrDefaultAsync(d => d.Id == id);
		}

		public async Task<Devis> CreateDevisAsync(Devis entity)
		{
			_db.Devis.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Devis> UpdateDevisAsync(Devis entity)
		{
			_db.Devis.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteDevisAsync(int id)
		{
			var entity = await _db.Devis.FindAsync(id);
			if (entity == null) return false;
			_db.Devis.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Sales Order Line operations
		public async Task<LigneCommandeVente> CreateLigneCommandeAsync(LigneCommandeVente entity)
		{
			_db.LigneCommandeVentes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneCommandeVente?> UpdateLigneCommandeAsync(LigneCommandeVente entity)
		{
			if (!await _db.LigneCommandeVentes.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneCommandeVentes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneCommandeAsync(int id)
		{
			var entity = await _db.LigneCommandeVentes.FindAsync(id);
			if (entity == null) return false;
			_db.LigneCommandeVentes.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Delivery operations
		public async Task<Livraison> CreateLivraisonAsync(Livraison entity)
		{
			_db.Livraisons.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Livraison?> UpdateLivraisonAsync(Livraison entity)
		{
			if (!await _db.Livraisons.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.Livraisons.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLivraisonAsync(int id)
		{
			var entity = await _db.Livraisons.FindAsync(id);
			if (entity == null) return false;
			_db.Livraisons.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Delivery Line operations
		public async Task<LigneLivraison> CreateLigneLivraisonAsync(LigneLivraison entity)
		{
			_db.LigneLivraisons.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneLivraison?> UpdateLigneLivraisonAsync(LigneLivraison entity)
		{
			if (!await _db.LigneLivraisons.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneLivraisons.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneLivraisonAsync(int id)
		{
			var entity = await _db.LigneLivraisons.FindAsync(id);
			if (entity == null) return false;
			_db.LigneLivraisons.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Sales Invoice operations
		public async Task<FactureVente> CreateFactureAsync(FactureVente entity)
		{
			_db.FactureVentes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<FactureVente?> UpdateFactureAsync(FactureVente entity)
		{
			if (!await _db.FactureVentes.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.FactureVentes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteFactureAsync(int id)
		{
			var entity = await _db.FactureVentes.FindAsync(id);
			if (entity == null) return false;
			_db.FactureVentes.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Sales Invoice Line operations
		public async Task<LigneFactureVente> CreateLigneFactureAsync(LigneFactureVente entity)
		{
			_db.LigneFactureVentes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneFactureVente?> UpdateLigneFactureAsync(LigneFactureVente entity)
		{
			if (!await _db.LigneFactureVentes.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneFactureVentes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneFactureAsync(int id)
		{
			var entity = await _db.LigneFactureVentes.FindAsync(id);
			if (entity == null) return false;
			_db.LigneFactureVentes.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Sales Return operations
		public async Task<RetourVente> CreateRetourAsync(RetourVente entity)
		{
			_db.RetourVentes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<RetourVente?> UpdateRetourAsync(RetourVente entity)
		{
			if (!await _db.RetourVentes.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.RetourVentes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteRetourAsync(int id)
		{
			var entity = await _db.RetourVentes.FindAsync(id);
			if (entity == null) return false;
			_db.RetourVentes.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}

		// Sales Return Line operations
		public async Task<LigneRetourVente> CreateLigneRetourAsync(LigneRetourVente entity)
		{
			_db.LigneRetourVentes.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<LigneRetourVente?> UpdateLigneRetourAsync(LigneRetourVente entity)
		{
			if (!await _db.LigneRetourVentes.AnyAsync(x => x.Id == entity.Id)) return null;
			_db.LigneRetourVentes.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteLigneRetourAsync(int id)
		{
			var entity = await _db.LigneRetourVentes.FindAsync(id);
			if (entity == null) return false;
			_db.LigneRetourVentes.Remove(entity);
			await _db.SaveChangesAsync();
			return true;
		}
	}
}