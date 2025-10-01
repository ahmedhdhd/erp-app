using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
	public class ProductService
	{
		private readonly IProductDAO _dao;

		public ProductService(IProductDAO dao)
		{
			_dao = dao;
		}

		public async Task<ProductApiResponse<ProductListResponse>> GetAllAsync(int page, int pageSize)
		{
			var (items, total) = await _dao.GetAllAsync(page, pageSize);
			var dtos = items.Select(MapToDTO).ToList();
			return Success(new ProductListResponse
			{
				Products = dtos,
				TotalCount = total,
				Page = page,
				PageSize = pageSize,
				TotalPages = (int)Math.Ceiling(total / (double)pageSize),
				HasPreviousPage = page > 1,
				HasNextPage = page * pageSize < total
			});
		}

		public async Task<ProductApiResponse<ProductListResponse>> SearchAsync(ProductSearchRequest request)
		{
			var (items, total) = await _dao.SearchAsync(
				request.SearchTerm,
				request.CategorieId,
				request.SousCategorie,
				request.Statut,
				request.PrixMin,
				request.PrixMax,
				request.StockFaible,
				request.RuptureStock,
				request.Unite,
				request.DateCreationFrom,
				request.DateCreationTo,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new ProductListResponse
			{
				Products = dtos,
				TotalCount = total,
				Page = request.Page,
				PageSize = request.PageSize,
				TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
				HasPreviousPage = request.Page > 1,
				HasNextPage = request.Page * request.PageSize < total
			});
		}

		public async Task<ProductApiResponse<ProductDTO>> GetByIdAsync(int id)
		{
			var p = await _dao.GetByIdAsync(id);
			if (p == null) return Failure<ProductDTO>("Produit introuvable");
			return Success(MapToDTO(p));
		}

		public async Task<ProductApiResponse<ProductDTO>> CreateAsync(CreateProductRequest request)
		{
			// Get the category name based on the category ID
			var category = await _dao.GetCategoryByIdAsync(request.CategorieId);
			var categoryName = category?.Nom ?? "Non classé";

			var entity = new Produit
			{
				Reference = request.Reference,
				Designation = request.Designation,
				Description = request.Description,
				Categorie = categoryName, // Set the category name
				SousCategorie = request.SousCategorie,
				PrixAchat = request.PrixAchat,
				PrixVente = request.PrixVente,
				PrixVenteMin = request.PrixVenteMin,
				TauxTVA = request.TauxTVA, // Set the VAT rate
				Unite = request.Unite,
				Statut = request.Statut,
				StockActuel = request.StockActuel,
				StockMinimum = request.StockMinimum,
				StockMaximum = request.StockMaximum,
				Variantes = request.Variantes?.Select(v => new VariantProduit
				{
					Taille = v.Taille,
					Couleur = v.Couleur,
					ReferenceVariant = v.ReferenceVariant,
					StockActuel = v.StockActuel
				}).ToList() ?? new System.Collections.Generic.List<VariantProduit>()
			};
			var created = await _dao.CreateAsync(entity);
			return Success(MapToDTO(created));
		}

		public async Task<ProductApiResponse<ProductDTO>> UpdateAsync(int id, UpdateProductRequest request)
		{
			var existing = await _dao.GetByIdAsync(id);
			if (existing == null) return Failure<ProductDTO>("Produit introuvable");
			existing.Reference = request.Reference;
			existing.Designation = request.Designation;
			existing.Description = request.Description;
			existing.SousCategorie = request.SousCategorie;
			existing.PrixAchat = request.PrixAchat;
			existing.PrixVente = request.PrixVente;
			existing.PrixVenteMin = request.PrixVenteMin;
			existing.TauxTVA = request.TauxTVA; // Update the VAT rate
			existing.Unite = request.Unite;
			existing.Statut = request.Statut;
			existing.StockActuel = request.StockActuel;
			existing.StockMinimum = request.StockMinimum;
			existing.StockMaximum = request.StockMaximum;
			var updated = await _dao.UpdateAsync(existing);
			return Success(MapToDTO(updated));
		}

		public async Task<ProductApiResponse<bool>> DeleteAsync(int id)
		{
			var ok = await _dao.DeleteAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<ProductApiResponse<bool>> UpdateStatusAsync(int id, string newStatus)
		{
			var ok = await _dao.UpdateStatusAsync(id, newStatus);
			return ok ? Success(true) : Failure<bool>("Mise à jour du statut impossible");
		}

		// Categories
		public async Task<ProductApiResponse<System.Collections.Generic.List<CategoryDTO>>> GetCategoriesAsync()
		{
			var cats = await _dao.GetCategoriesAsync();
			return Success(cats.Select(MapToDTO).ToList());
		}
		public async Task<ProductApiResponse<CategoryDTO>> GetCategoryByIdAsync(int id)
		{
			var c = await _dao.GetCategoryByIdAsync(id);
			if (c == null) return Failure<CategoryDTO>("Catégorie introuvable");
			return Success(MapToDTO(c));
		}
		public async Task<ProductApiResponse<CategoryDTO>> CreateCategoryAsync(CreateProductCategoryRequest request)
		{
			var cat = new Category { Nom = request.Nom, Description = request.Description, CategorieParentId = request.CategorieParentId, EstActif = request.EstActif };
			var created = await _dao.CreateCategoryAsync(cat);
			return Success(MapToDTO(created));
		}
		public async Task<ProductApiResponse<CategoryDTO>> UpdateCategoryAsync(int id, UpdateProductCategoryRequest request)
		{
			var cat = await _dao.GetCategoryByIdAsync(id);
			if (cat == null) return Failure<CategoryDTO>("Catégorie introuvable");
			cat.Nom = request.Nom; cat.Description = request.Description; cat.CategorieParentId = request.CategorieParentId; cat.EstActif = request.EstActif;
			var updated = await _dao.UpdateCategoryAsync(cat);
			return Success(MapToDTO(updated));
		}
		public async Task<ProductApiResponse<bool>> DeleteCategoryAsync(int id)
		{
			var ok = await _dao.DeleteCategoryAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		// Variants
		public async Task<ProductApiResponse<System.Collections.Generic.List<VariantDTO>>> GetVariantsByProductAsync(int productId)
		{
			var vars = await _dao.GetVariantsByProductAsync(productId);
			return Success(vars.Select(MapToDTO).ToList());
		}
		public async Task<ProductApiResponse<VariantDTO>> CreateVariantAsync(CreateVariantRequest request)
		{
			var v = new VariantProduit { ProduitId = 0, Taille = request.Taille, Couleur = request.Couleur, ReferenceVariant = request.ReferenceVariant, StockActuel = request.StockActuel };
			var created = await _dao.CreateVariantAsync(v);
			return Success(MapToDTO(created));
		}
		public async Task<ProductApiResponse<VariantDTO>> UpdateVariantAsync(int id, UpdateVariantRequest request)
		{
			var v = new VariantProduit { Id = id, ProduitId = 0, Taille = request.Taille, Couleur = request.Couleur, ReferenceVariant = request.ReferenceVariant };
			var updated = await _dao.UpdateVariantAsync(v);
			return Success(MapToDTO(updated));
		}
		public async Task<ProductApiResponse<bool>> DeleteVariantAsync(int id)
		{
			var ok = await _dao.DeleteVariantAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		// Stock
		public async Task<ProductApiResponse<System.Collections.Generic.List<StockMovementDTO>>> GetStockMovementsAsync(int productId, int? variantId)
		{
			var list = await _dao.GetStockMovementsAsync(productId, variantId);
			return Success(list.Select(MapToDTO).ToList());
		}
		public async Task<ProductApiResponse<StockMovementDTO>> CreateStockAdjustmentAsync(int productId, StockAdjustmentRequest request)
		{
			var movement = new MouvementStock
			{
				ProduitId = productId,
				DateMouvement = DateTime.UtcNow,
				Type = "Ajustement",
				Quantite = request.NewQuantity,
				ReferenceDocument = request.Reference,
				Emplacement = request.Emplacement
			};
			var created = await _dao.CreateStockAdjustmentAsync(movement);
			return Success(MapToDTO(created));
		}

		public ProductApiResponse<System.Collections.Generic.List<ProductDTO>> GetStockAlerts()
		{
			// This would require a query; for now kept simple via GetAllAsync.
			return Failure<System.Collections.Generic.List<ProductDTO>>("Not implemented");
		}

		public ProductApiResponse<System.Collections.Generic.List<string>> GetStatuses() => Success(new System.Collections.Generic.List<string> { "Actif", "Inactif", "Discontinué", "Rupture" });
		public ProductApiResponse<System.Collections.Generic.List<string>> GetUnits() => Success(new System.Collections.Generic.List<string> { "Pièce", "Kg", "Litre", "Mètre", "M²", "M³", "Boîte", "Paquet", "Carton", "Palette", "Gramme", "Tonne", "Millilitre", "Centimètre", "Millimètre" });

		private static ProductDTO MapToDTO(Produit p)
		{
			var dto = new ProductDTO
			{
				Id = p.Id,
				Reference = p.Reference,
				Designation = p.Designation,
				Description = p.Description,
				CategorieId = 0,
				Categorie = p.Categorie,
				SousCategorie = p.SousCategorie,
				PrixAchat = p.PrixAchat,
				PrixVente = p.PrixVente,
				PrixVenteMin = p.PrixVenteMin,
				TauxTVA = p.TauxTVA,
				PrixAchatHT = p.PrixAchat,
				PrixVenteHT = p.PrixVente,
				PrixVenteMinHT = p.PrixVenteMin,
				PrixAchatTTC = p.PrixAchat * (1 + p.TauxTVA / 100),
				PrixVenteTTC = p.PrixVente * (1 + p.TauxTVA / 100),
				PrixVenteMinTTC = p.PrixVenteMin * (1 + p.TauxTVA / 100),
				Unite = p.Unite,
				Statut = p.Statut,
				StockActuel = p.StockActuel,
				StockMinimum = p.StockMinimum,
				StockMaximum = p.StockMaximum,
				EstStockFaible = p.StockActuel > 0 && p.StockActuel <= p.StockMinimum,
				EstRuptureStock = p.StockActuel <= 0,
				ValeurStock = p.StockActuel * p.PrixAchat,
				MargeBrute = Math.Max(0, p.PrixVente - p.PrixAchat),
				PourcentageMarge = p.PrixVente > 0 ? Math.Round((p.PrixVente - p.PrixAchat) / p.PrixVente * 100, 2) : 0,
				DateCreation = DateTime.UtcNow,
				Variantes = p.Variantes?.Select(MapToDTO).ToList() ?? new List<VariantDTO>(),
				DerniersMovements = p.Mouvements?.OrderByDescending(m => m.DateMouvement).Take(10).Select(MapToDTO).ToList() ?? new List<StockMovementDTO>()
			};
			return dto;
		}

		private static VariantDTO MapToDTO(VariantProduit v) => new VariantDTO { Id = v.Id, ProduitId = v.ProduitId, Taille = v.Taille, Couleur = v.Couleur, ReferenceVariant = v.ReferenceVariant, StockActuel = v.StockActuel, EstRuptureStock = v.StockActuel <= 0 };
		private static CategoryDTO MapToDTO(Category c) => new CategoryDTO { Id = c.Id, Nom = c.Nom, Description = c.Description, CategorieParentId = c.CategorieParentId, CategorieParent = c.CategorieParent?.Nom ?? string.Empty, EstActif = c.EstActif, NombreProduits = c.Produits?.Count ?? 0, NombreSousCategories = c.SousCategories?.Count ?? 0, DateCreation = DateTime.UtcNow, SousCategories = c.SousCategories?.Select(MapToDTO).ToList() ?? new List<CategoryDTO>() };
		private static StockMovementDTO MapToDTO(MouvementStock m) => new StockMovementDTO { Id = m.Id, ProduitId = m.ProduitId, ProduitReference = string.Empty, ProduitDesignation = string.Empty, DateMouvement = m.DateMouvement, Type = m.Type, Quantite = m.Quantite, ReferenceDocument = m.ReferenceDocument, Emplacement = m.Emplacement, CreePar = string.Empty };

		private static ProductApiResponse<T> Success<T>(T data) => new ProductApiResponse<T> { Success = true, Message = "OK", Data = data };
		private static ProductApiResponse<T> Failure<T>(string message) => new ProductApiResponse<T> { Success = false, Message = message, Errors = new List<string> { message } };
	}
}


