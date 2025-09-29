using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
	// Sales Quote/Estimate DTOs
	public class DevisDTO
	{
		public int Id { get; set; }
		public int ClientId { get; set; }
		public ClientDTO Client { get; set; }
		public DateTime DateCreation { get; set; }
		public DateTime DateExpiration { get; set; }
		public string Statut { get; set; } // Brouillon, Envoyé, Accepté, Rejeté
		public decimal MontantHT { get; set; }
		public decimal MontantTTC { get; set; }
		public decimal Remise { get; set; }
		public List<LigneDevisDTO> Lignes { get; set; } = new();
	}

	public class LigneDevisDTO
	{
		public int Id { get; set; }
		public int DevisId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaireHT { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixUnitaireTTC { get; set; }
		public decimal TotalLigne { get; set; }
	}

	public class CreateDevisRequest
	{
		public int ClientId { get; set; }
		public DateTime DateExpiration { get; set; }
		public decimal Remise { get; set; }
		public List<CreateLigneDevisRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneDevisRequest
	{
		public int ProduitId { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaireHT { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixUnitaireTTC { get; set; }
	}

	public class UpdateDevisRequest : CreateDevisRequest
	{
		public int Id { get; set; }
	}

	// Sales Order DTOs
	public class CommandeVenteDTO
	{
		public int Id { get; set; }
		public int ClientId { get; set; }
		public ClientDTO Client { get; set; }
		public int? DevisId { get; set; }
		public DateTime DateCommande { get; set; }
		public string Statut { get; set; } // Brouillon, Confirmé, Expédié, Livré, Annulé
		public decimal MontantHT { get; set; }
		public decimal MontantTTC { get; set; }
		public string ModeLivraison { get; set; }
		public string ConditionsPaiement { get; set; }
		public List<LigneCommandeVenteDTO> Lignes { get; set; } = new();
		public List<LivraisonDTO> Livraisons { get; set; } = new();
		public List<FactureVenteDTO> Factures { get; set; } = new();
	}

	public class LigneCommandeVenteDTO
	{
		public int Id { get; set; }
		public int CommandeId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaireHT { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixUnitaireTTC { get; set; }
		public decimal TotalLigne { get; set; }
	}

	public class CreateCommandeVenteRequest
	{
		public int ClientId { get; set; }
		public int? DevisId { get; set; }
		public string ModeLivraison { get; set; }
		public string ConditionsPaiement { get; set; }
		public List<CreateLigneCommandeVenteRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneCommandeVenteRequest
	{
		public int ProduitId { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaireHT { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixUnitaireTTC { get; set; }
	}

	public class UpdateCommandeVenteRequest : CreateCommandeVenteRequest
	{
		public int Id { get; set; }
	}

	// Delivery DTOs
	public class LivraisonDTO
	{
		public int Id { get; set; }
		public int CommandeId { get; set; }
		public CommandeVenteDTO Commande { get; set; }
		public DateTime DateLivraison { get; set; }
		public string Statut { get; set; } // En préparation, Expédié, Livré, Partiel
		public string Transportateur { get; set; }
		public string NumeroSuivi { get; set; }
		public List<LigneLivraisonDTO> Lignes { get; set; } = new();
	}

	public class LigneLivraisonDTO
	{
		public int Id { get; set; }
		public int LivraisonId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
	}

	public class CreateLivraisonRequest
	{
		public int CommandeId { get; set; }
		public DateTime DateLivraison { get; set; }
		public string Transportateur { get; set; }
		public string NumeroSuivi { get; set; }
		public List<CreateLigneLivraisonRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneLivraisonRequest
	{
		public int CommandeLigneId { get; set; }
		public int Quantite { get; set; }
	}

	// Sales Invoice DTOs
	public class FactureVenteDTO
	{
		public int Id { get; set; }
		public int CommandeId { get; set; }
		public CommandeVenteDTO Commande { get; set; }
		public int ClientId { get; set; }
		public ClientDTO Client { get; set; }
		public DateTime DateFacture { get; set; }
		public DateTime DateEcheance { get; set; }
		public string Statut { get; set; } // Brouillon, Envoyée, Payée, Partielle, En retard
		public decimal MontantHT { get; set; }
		public decimal MontantTTC { get; set; }
		public decimal MontantPaye { get; set; }
		public List<LigneFactureVenteDTO> Lignes { get; set; } = new();
		public List<RetourVenteDTO> Retours { get; set; } = new();
		public List<PaiementClientDTO> Paiements { get; set; } = new();
	}

	public class LigneFactureVenteDTO
	{
		public int Id { get; set; }
		public int FactureId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaireHT { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixUnitaireTTC { get; set; }
		public decimal TotalLigne { get; set; }
	}

	public class CreateFactureVenteRequest
	{
		public int CommandeId { get; set; }
		public DateTime DateEcheance { get; set; }
		public List<CreateLigneFactureVenteRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneFactureVenteRequest
	{
		public int CommandeLigneId { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaireHT { get; set; }
		public decimal TauxTVA { get; set; }
		public decimal PrixUnitaireTTC { get; set; }
	}

	// Sales Return DTOs
	public class RetourVenteDTO
	{
		public int Id { get; set; }
		public int FactureId { get; set; }
		public FactureVenteDTO Facture { get; set; }
		public int ClientId { get; set; }
		public ClientDTO Client { get; set; }
		public DateTime DateRetour { get; set; }
		public string Motif { get; set; }
		public string Statut { get; set; } // En attente, Traité, Remboursé, Échange
		public List<LigneRetourVenteDTO> Lignes { get; set; } = new();
	}

	public class LigneRetourVenteDTO
	{
		public int Id { get; set; }
		public int RetourId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
	}

	public class CreateRetourVenteRequest
	{
		public int FactureId { get; set; }
		public string Motif { get; set; }
		public List<CreateLigneRetourVenteRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneRetourVenteRequest
	{
		public int FactureLigneId { get; set; }
		public int Quantite { get; set; }
	}

	// Common Response DTOs
	public class CommandeVenteListResponse
	{
		public List<CommandeVenteDTO> Commandes { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
	}

	public class DevisListResponse
	{
		public List<DevisDTO> Devis { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
	}
}