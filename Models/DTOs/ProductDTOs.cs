using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
	public class CreateProductRequest
	{
		public string Reference { get; set; }
		public string Designation { get; set; }
		public string Description { get; set; }
		public int CategorieId { get; set; }
		public string SousCategorie { get; set; }
		public decimal PrixAchat { get; set; }
		public decimal PrixVente { get; set; }
		public decimal PrixVenteMin { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixAchatHT { get; set; }
		public decimal PrixVenteHT { get; set; }
		public decimal PrixVenteMinHT { get; set; }
		public decimal PrixAchatTTC { get; set; }
		public decimal PrixVenteTTC { get; set; }
		public decimal PrixVenteMinTTC { get; set; }
		public string Unite { get; set; }
		public int StockActuel { get; set; }
		public int StockMinimum { get; set; }
		public int StockMaximum { get; set; }
		public string Statut { get; set; }
		public List<CreateVariantRequest> Variantes { get; set; } = new();
	}

	public class UpdateProductRequest : CreateProductRequest
	{
		public int Id { get; set; }
	}

	public class ProductSearchRequest
	{
		public string? SearchTerm { get; set; }
		public int? CategorieId { get; set; }
		public string? SousCategorie { get; set; }
		public string? Statut { get; set; }
		public decimal? PrixMin { get; set; }
		public decimal? PrixMax { get; set; }
		public bool? StockFaible { get; set; }
		public bool? RuptureStock { get; set; }
		public string? Unite { get; set; }
		public DateTime? DateCreationFrom { get; set; }
		public DateTime? DateCreationTo { get; set; }
		public string SortBy { get; set; }
		public string SortDirection { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
	}

	public class CreateVariantRequest
	{
		public string Taille { get; set; }
		public string Couleur { get; set; }
		public string ReferenceVariant { get; set; }
		public int StockActuel { get; set; }
	}

	public class UpdateVariantRequest : CreateVariantRequest
	{
		public int Id { get; set; }
	}

	public class CreateCategoryRequest
	{
		public string Nom { get; set; }
		public string Description { get; set; }
		public int? CategorieParentId { get; set; }
		public bool EstActif { get; set; }
	}

	public class UpdateCategoryRequest : CreateCategoryRequest
	{
		public int Id { get; set; }
	}

	public class ProductDTO
	{
		public int Id { get; set; }
		public string Reference { get; set; }
		public string Designation { get; set; }
		public string Description { get; set; }
		public int CategorieId { get; set; }
		public string Categorie { get; set; }
		public string SousCategorie { get; set; }
		public decimal PrixAchat { get; set; }
		public decimal PrixVente { get; set; }
		public decimal PrixVenteMin { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixAchatHT { get; set; }
		public decimal PrixVenteHT { get; set; }
		public decimal PrixVenteMinHT { get; set; }
		public decimal PrixAchatTTC { get; set; }
		public decimal PrixVenteTTC { get; set; }
		public decimal PrixVenteMinTTC { get; set; }
		public string Unite { get; set; }
		public string Statut { get; set; }
		public int StockActuel { get; set; }
		public int StockMinimum { get; set; }
		public int StockMaximum { get; set; }
		public bool EstStockFaible { get; set; }
		public bool EstRuptureStock { get; set; }
		public decimal ValeurStock { get; set; }
		public decimal MargeBrute { get; set; }
		public decimal PourcentageMarge { get; set; }
		public DateTime DateCreation { get; set; }
		public DateTime? DateModification { get; set; }
		public List<VariantDTO> Variantes { get; set; } = new();
		public List<StockMovementDTO> DerniersMovements { get; set; } = new();
	}

	public class VariantDTO
	{
		public int Id { get; set; }
		public int ProduitId { get; set; }
		public string Taille { get; set; }
		public string Couleur { get; set; }
		public string ReferenceVariant { get; set; }
		public int StockActuel { get; set; }
		public bool EstRuptureStock { get; set; }
	}

	public class CategoryDTO
	{
		public int Id { get; set; }
		public string Nom { get; set; }
		public string Description { get; set; }
		public int? CategorieParentId { get; set; }
		public string CategorieParent { get; set; }
		public bool EstActif { get; set; }
		public int NombreProduits { get; set; }
		public int NombreSousCategories { get; set; }
		public DateTime DateCreation { get; set; }
		public DateTime? DateModification { get; set; }
		public List<CategoryDTO> SousCategories { get; set; } = new();
	}

	public class StockMovementDTO
	{
		public int Id { get; set; }
		public int ProduitId { get; set; }
		public string ProduitReference { get; set; }
		public string ProduitDesignation { get; set; }
		public DateTime DateMouvement { get; set; }
		public string Type { get; set; }
		public int Quantite { get; set; }
		public string ReferenceDocument { get; set; }
		public string Emplacement { get; set; }
		public string CreePar { get; set; }
	}

	public class ProductListResponse
	{
		public List<ProductDTO> Products { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasPreviousPage { get; set; }
		public bool HasNextPage { get; set; }
	}

	public class ProductStatsResponse
	{
		public int TotalProducts { get; set; }
		public int ActiveProducts { get; set; }
		public int InactiveProducts { get; set; }
		public int LowStockProducts { get; set; }
		public int OutOfStockProducts { get; set; }
		public int TotalCategories { get; set; }
		public decimal TotalStockValue { get; set; }
		public decimal AveragePrice { get; set; }
		public decimal AverageMargin { get; set; }
		public List<CategoryStatsResponse> TopCategories { get; set; } = new();
		public List<ProductDTO> LowStockAlerts { get; set; } = new();
		public List<ProductDTO> OutOfStockAlerts { get; set; } = new();
	}

	public class CategoryStatsResponse
	{
		public int CategorieId { get; set; }
		public string Nom { get; set; }
		public int NombreProduits { get; set; }
		public decimal ValeurStock { get; set; }
		public decimal PourcentageTotal { get; set; }
	}

	public class ProductApiResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; }
		public T? Data { get; set; }
		public List<string> Errors { get; set; } = new();
	}

	public class StockAdjustmentRequest
	{
		public int ProductId { get; set; }
		public int? VariantId { get; set; }
		public int NewQuantity { get; set; }
		public string Reference { get; set; }
		public string Emplacement { get; set; }
		public string Reason { get; set; }
	}
}


