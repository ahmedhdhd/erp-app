using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
	// Purchase Order DTOs
	public class CommandeAchatDTO
	{
		public int Id { get; set; }
		public int FournisseurId { get; set; }
		public FournisseurDTO Fournisseur { get; set; }
		public int? DemandeId { get; set; }
		public DateTime DateCommande { get; set; }
		public DateTime DateLivraisonPrevue { get; set; }
		public string Statut { get; set; } // Brouillon, Envoyée, Partielle, Livrée, Annulée
		public decimal MontantHT { get; set; }
		public decimal MontantTTC { get; set; }
		public List<LigneCommandeAchatDTO> Lignes { get; set; } = new();
		public List<ReceptionDTO> Receptions { get; set; } = new();
		public List<FactureAchatDTO> Factures { get; set; } = new();
	}

	public class LigneCommandeAchatDTO
	{
		public int Id { get; set; }
		public int CommandeId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaire { get; set; }
		public decimal TotalLigne { get; set; }
	}

	public class CreateCommandeAchatRequest
	{
		public int FournisseurId { get; set; }
		public int? DemandeId { get; set; }
		public DateTime DateLivraisonPrevue { get; set; }
		public List<CreateLigneCommandeAchatRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneCommandeAchatRequest
	{
		public int ProduitId { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaire { get; set; }
	}

	public class UpdateCommandeAchatRequest : CreateCommandeAchatRequest
	{
		public int Id { get; set; }
	}

	public class CommandeAchatListResponse
	{
		public List<CommandeAchatDTO> Commandes { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
	}

	// Purchase Request DTOs
	public class DemandeAchatDTO
	{
		public int Id { get; set; }
		public int EmployeId { get; set; }
		public EmployeeDTO Employe { get; set; }
		public DateTime DateDemande { get; set; }
		public string Statut { get; set; } // Brouillon, Approuvée, Rejetée, Commandée
		public List<LigneDemandeAchatDTO> Lignes { get; set; } = new();
	}

	public class LigneDemandeAchatDTO
	{
		public int Id { get; set; }
		public int DemandeId { get; set; }
		public int ProduitId { get; set; }
		public ProductDTO Produit { get; set; }
		public int Quantite { get; set; }
		public string Justification { get; set; }
	}

	public class CreateDemandeAchatRequest
	{
		public List<CreateLigneDemandeAchatRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneDemandeAchatRequest
	{
		public int ProduitId { get; set; }
		public int Quantite { get; set; }
		public string Justification { get; set; }
	}

	public class UpdateDemandeAchatRequest : CreateDemandeAchatRequest
	{
		public int Id { get; set; }
	}

	// Goods Receipt DTOs
	public class ReceptionDTO
	{
		public int Id { get; set; }
		public int CommandeId { get; set; }
		public CommandeAchatDTO Commande { get; set; }
		public DateTime DateReception { get; set; }
		public string Statut { get; set; } // Partielle, Complète
		public List<LigneReceptionDTO> Lignes { get; set; } = new();
	}

	public class LigneReceptionDTO
	{
		public int Id { get; set; }
		public int ReceptionId { get; set; }
		public int? LigneCommandeId { get; set; }
		public LigneCommandeAchatDTO LigneCommande { get; set; }
		public int QuantiteRecue { get; set; }
		public int QuantiteRejetee { get; set; }
		public string MotifRejet { get; set; }
	}

	public class CreateReceptionRequest
	{
		public DateTime DateReception { get; set; }
		public List<CreateLigneReceptionRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneReceptionRequest
	{
		public int LigneCommandeId { get; set; }
		public int QuantiteRecue { get; set; }
		public int QuantiteRejetee { get; set; }
		public string MotifRejet { get; set; }
	}

	// Purchase Invoice DTOs
	public class FactureAchatDTO
	{
		public int Id { get; set; }
		public int CommandeId { get; set; }
		public CommandeAchatDTO Commande { get; set; }
		public int FournisseurId { get; set; }
		public FournisseurDTO Fournisseur { get; set; }
		public DateTime DateFacture { get; set; }
		public DateTime DateEcheance { get; set; }
		public string Statut { get; set; } // Reçue, Validée, Payée, En retard
		public decimal MontantHT { get; set; }
		public decimal MontantTTC { get; set; }
		public decimal MontantPaye { get; set; }
		public List<LigneFactureAchatDTO> Lignes { get; set; } = new();
		public List<PaiementFournisseurDTO> Paiements { get; set; } = new();
	}

	public class LigneFactureAchatDTO
	{
		public int Id { get; set; }
		public int FactureId { get; set; }
		public int? LigneCommandeId { get; set; }
		public LigneCommandeAchatDTO LigneCommande { get; set; }
		public int QuantiteFacturee { get; set; }
		public decimal PrixUnitaire { get; set; }
		public decimal TotalLigne { get; set; }
	}

	public class CreateFactureAchatRequest
	{
		public DateTime DateEcheance { get; set; }
		public List<CreateLigneFactureAchatRequest> Lignes { get; set; } = new();
	}

	public class CreateLigneFactureAchatRequest
	{
		public int LigneCommandeId { get; set; }
		public int QuantiteFacturee { get; set; }
		public decimal PrixUnitaire { get; set; }
	}

	public class PaiementFournisseurDTO
	{
		public int Id { get; set; }
		public int FactureId { get; set; }
		public FactureAchatDTO Facture { get; set; }
		public int FournisseurId { get; set; }
		public FournisseurDTO Fournisseur { get; set; }
		public DateTime DatePaiement { get; set; }
		public decimal Montant { get; set; }
		public string MethodePaiement { get; set; }
		public string Reference { get; set; }
		public string Statut { get; set; }
	}
}