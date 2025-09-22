using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
	public class ProductDAO : IProductDAO
	{
		private readonly ApplicationDbContext _db;

		public ProductDAO(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<(IEnumerable<Produit> Items, int TotalCount)> GetAllAsync(int page, int pageSize)
		{
			var query = _db.Produits.Include(p => p.Variantes).Include(p => p.Mouvements).AsQueryable();
			var total = await query.CountAsync();
			var items = await query
				.OrderBy(p => p.Designation)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();
			return (items, total);
		}

		public async Task<(IEnumerable<Produit> Items, int TotalCount)> SearchAsync(string? searchTerm, int? categorieId, string? sousCategorie, string? statut, decimal? prixMin, decimal? prixMax, bool? stockFaible, bool? ruptureStock, string? unite, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize, string sortBy, string sortDirection)
		{
			var query = _db.Produits.Include(p => p.Variantes).Include(p => p.Mouvements).AsQueryable();

			if (!string.IsNullOrWhiteSpace(searchTerm))
			{
				var term = searchTerm.Trim().ToLower();
				query = query.Where(p =>
					EF.Functions.Like(p.Reference.ToLower(), $"%{term}%") ||
					EF.Functions.Like(p.Designation.ToLower(), $"%{term}%") ||
					EF.Functions.Like(p.Description.ToLower(), $"%{term}%")
				);
			}
			if (categorieId.HasValue) query = query.Where(p => EF.Property<int>(p, "CategoryId") == categorieId.Value);
			if (!string.IsNullOrWhiteSpace(sousCategorie)) query = query.Where(p => p.SousCategorie == sousCategorie);
			if (!string.IsNullOrWhiteSpace(statut)) query = query.Where(p => p.Statut == statut);
			if (prixMin.HasValue) query = query.Where(p => p.PrixVente >= prixMin.Value);
			if (prixMax.HasValue) query = query.Where(p => p.PrixVente <= prixMax.Value);
			if (!string.IsNullOrWhiteSpace(unite)) query = query.Where(p => p.Unite == unite);
			if (stockFaible == true) query = query.Where(p => p.StockActuel > 0 && p.StockActuel <= p.StockMinimum);
			if (ruptureStock == true) query = query.Where(p => p.StockActuel <= 0);

			bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
			switch (sortBy?.ToLower())
			{
				case "reference": query = desc ? query.OrderByDescending(p => p.Reference) : query.OrderBy(p => p.Reference); break;
				case "designation": query = desc ? query.OrderByDescending(p => p.Designation) : query.OrderBy(p => p.Designation); break;
				case "prixvente": query = desc ? query.OrderByDescending(p => p.PrixVente) : query.OrderBy(p => p.PrixVente); break;
				case "stockactuel": query = desc ? query.OrderByDescending(p => p.StockActuel) : query.OrderBy(p => p.StockActuel); break;
				default: query = query.OrderBy(p => p.Designation); break;
			}

			var total = await query.CountAsync();
			var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
			return (items, total);
		}

		public Task<Produit?> GetByIdAsync(int id)
		{
			return _db.Produits.Include(p => p.Variantes).Include(p => p.Mouvements).FirstOrDefaultAsync(p => p.Id == id);
		}

		public async Task<Produit> CreateAsync(Produit entity)
		{
			_db.Produits.Add(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<Produit> UpdateAsync(Produit entity)
		{
			_db.Produits.Update(entity);
			await _db.SaveChangesAsync();
			return entity;
		}

		public async Task<bool> DeleteAsync(int id)
		{
			var p = await _db.Produits.FindAsync(id);
			if (p == null) return false;
			_db.Produits.Remove(p);
			await _db.SaveChangesAsync();
			return true;
		}

		public async Task<bool> UpdateStatusAsync(int id, string newStatus)
		{
			var p = await _db.Produits.FindAsync(id);
			if (p == null) return false;
			p.Statut = newStatus;
			await _db.SaveChangesAsync();
			return true;
		}

		public Task<List<Category>> GetCategoriesAsync() => _db.Categories.Include(c => c.SousCategories).ToListAsync();
		public Task<Category?> GetCategoryByIdAsync(int id) => _db.Categories.Include(c => c.SousCategories).FirstOrDefaultAsync(c => c.Id == id);
		public async Task<Category> CreateCategoryAsync(Category category) { _db.Categories.Add(category); await _db.SaveChangesAsync(); return category; }
		public async Task<Category> UpdateCategoryAsync(Category category) { _db.Categories.Update(category); await _db.SaveChangesAsync(); return category; }
		public async Task<bool> DeleteCategoryAsync(int id) { var c = await _db.Categories.FindAsync(id); if (c == null) return false; _db.Categories.Remove(c); await _db.SaveChangesAsync(); return true; }

		public Task<List<VariantProduit>> GetVariantsByProductAsync(int productId) => _db.VariantProduits.Where(v => v.ProduitId == productId).ToListAsync();
		public async Task<VariantProduit> CreateVariantAsync(VariantProduit variant) { _db.VariantProduits.Add(variant); await _db.SaveChangesAsync(); return variant; }
		public async Task<VariantProduit> UpdateVariantAsync(VariantProduit variant) { _db.VariantProduits.Update(variant); await _db.SaveChangesAsync(); return variant; }
		public async Task<bool> DeleteVariantAsync(int id) { var v = await _db.VariantProduits.FindAsync(id); if (v == null) return false; _db.VariantProduits.Remove(v); await _db.SaveChangesAsync(); return true; }

		public Task<List<MouvementStock>> GetStockMovementsAsync(int productId, int? variantId)
		{
			var q = _db.MouvementStocks.Where(m => m.ProduitId == productId);
			return q.OrderByDescending(m => m.DateMouvement).Take(100).ToListAsync();
		}

		public async Task<MouvementStock> CreateStockAdjustmentAsync(MouvementStock movement)
		{
			_db.MouvementStocks.Add(movement);
			// adjust product stock
			var product = await _db.Produits.FindAsync(movement.ProduitId);
			if (product != null)
			{
				product.StockActuel = movement.Quantite;
			}
			await _db.SaveChangesAsync();
			return movement;
		}
	}
}


