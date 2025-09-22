using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
	public interface IProductDAO
	{
		Task<(IEnumerable<Produit> Items, int TotalCount)> GetAllAsync(int page, int pageSize);
		Task<(IEnumerable<Produit> Items, int TotalCount)> SearchAsync(
			string? searchTerm,
			int? categorieId,
			string? sousCategorie,
			string? statut,
			decimal? prixMin,
			decimal? prixMax,
			bool? stockFaible,
			bool? ruptureStock,
			string? unite,
			System.DateTime? dateFrom,
			System.DateTime? dateTo,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<Produit?> GetByIdAsync(int id);
		Task<Produit> CreateAsync(Produit entity);
		Task<Produit> UpdateAsync(Produit entity);
		Task<bool> DeleteAsync(int id);
		Task<bool> UpdateStatusAsync(int id, string newStatus);

		// Category
		Task<List<Category>> GetCategoriesAsync();
		Task<Category?> GetCategoryByIdAsync(int id);
		Task<Category> CreateCategoryAsync(Category category);
		Task<Category> UpdateCategoryAsync(Category category);
		Task<bool> DeleteCategoryAsync(int id);

		// Variants
		Task<List<VariantProduit>> GetVariantsByProductAsync(int productId);
		Task<VariantProduit> CreateVariantAsync(VariantProduit variant);
		Task<VariantProduit> UpdateVariantAsync(VariantProduit variant);
		Task<bool> DeleteVariantAsync(int id);

		// Stock
		Task<List<MouvementStock>> GetStockMovementsAsync(int productId, int? variantId);
		Task<MouvementStock> CreateStockAdjustmentAsync(MouvementStock movement);
	}
}


