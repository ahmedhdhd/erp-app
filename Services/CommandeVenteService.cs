using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
	public class CommandeVenteService
	{
		private readonly ICommandeVenteDAO _dao;
		private readonly IProductDAO _productDAO;

		public CommandeVenteService(ICommandeVenteDAO dao, IProductDAO productDAO)
		{
			_dao = dao;
			_productDAO = productDAO;
		}

		// Sales Order operations
		public async Task<ClientApiResponse<CommandeVenteListResponse>> GetAllAsync(int page, int pageSize)
		{
			var (items, total) = await _dao.GetAllAsync(page, pageSize);
			var dtos = items.Select(MapToDTO).ToList();
			return Success(new CommandeVenteListResponse
			{
				Commandes = dtos,
				TotalCount = total,
				Page = page,
				PageSize = pageSize,
				TotalPages = (int)Math.Ceiling(total / (double)pageSize),
				HasNextPage = page * pageSize < total,
				HasPreviousPage = page > 1
			});
		}

		public async Task<ClientApiResponse<CommandeVenteListResponse>> SearchAsync(CommandeVenteSearchRequest request)
		{
			var (items, total) = await _dao.SearchAsync(
				request.ClientId,
				request.Statut,
				request.DateDebut,
				request.DateFin,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new CommandeVenteListResponse
			{
				Commandes = dtos,
				TotalCount = total,
				Page = request.Page,
				PageSize = request.PageSize,
				TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
				HasNextPage = request.Page * request.PageSize < total,
				HasPreviousPage = request.Page > 1
			});
		}

		public async Task<ClientApiResponse<CommandeVenteDTO>> GetByIdAsync(int id)
		{
			var commande = await _dao.GetByIdAsync(id);
			if (commande == null) return Failure<CommandeVenteDTO>("Commande de vente introuvable");
			return Success(MapToDTO(commande));
		}

		public async Task<ClientApiResponse<CommandeVenteDTO>> CreateAsync(CreateCommandeVenteRequest request)
		{
			try
			{
				Debug.WriteLine($"CreateAsync called with ClientId: {request.ClientId}");
				Debug.WriteLine($"Request data: Lignes count={request.Lignes?.Count() ?? 0}");

				var entity = new CommandeVente
				{
					ClientId = request.ClientId,
					DevisId = request.DevisId,
					DateCommande = DateTime.Now,
					Statut = "Brouillon", // Default status
					ModeLivraison = request.ModeLivraison ?? "",
					ConditionsPaiement = request.ConditionsPaiement ?? "",
					Lignes = new List<LigneCommandeVente>()
				};

				// Calculate amounts and create line items
				decimal montantHT = 0;
				foreach (var ligneRequest in request.Lignes)
				{
					var produit = await _productDAO.GetByIdAsync(ligneRequest.ProduitId);
					if (produit == null) continue; // Skip invalid products

					var ligne = new LigneCommandeVente
					{
						ProduitId = ligneRequest.ProduitId,
						Quantite = ligneRequest.Quantite,
						PrixUnitaire = ligneRequest.PrixUnitaire,
						TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaire
					};

					entity.Lignes.Add(ligne);
					montantHT += ligne.TotalLigne;
				}

				entity.MontantHT = montantHT;
				entity.MontantTTC = montantHT * 1.2m; // Assuming 20% VAT

				var created = await _dao.CreateAsync(entity);
				return Success(MapToDTO(created));
			}
			catch (Exception ex)
			{
				Debug.WriteLine($"Exception in CreateAsync: {ex}");
				return Failure<CommandeVenteDTO>($"Erreur interne du serveur: {ex.Message}");
			}
		}

		public async Task<ClientApiResponse<CommandeVenteDTO>> UpdateAsync(int id, UpdateCommandeVenteRequest request)
		{
			var existing = await _dao.GetByIdAsync(id);
			if (existing == null) return Failure<CommandeVenteDTO>("Commande de vente introuvable");

			existing.ClientId = request.ClientId;
			existing.DevisId = request.DevisId;
			existing.ModeLivraison = request.ModeLivraison ?? existing.ModeLivraison;
			existing.ConditionsPaiement = request.ConditionsPaiement ?? existing.ConditionsPaiement;

			// Recalculate amounts
			decimal montantHT = 0;
			foreach (var ligneRequest in request.Lignes)
			{
				var produit = await _productDAO.GetByIdAsync(ligneRequest.ProduitId);
				if (produit == null) continue; // Skip invalid products

				// For simplicity, we're not handling line item updates properly here
				// In a real implementation, we would need to handle line item CRUD operations properly
				var ligne = new LigneCommandeVente
				{
					ProduitId = ligneRequest.ProduitId,
					Quantite = ligneRequest.Quantite,
					PrixUnitaire = ligneRequest.PrixUnitaire,
					TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaire
				};

				montantHT += ligne.TotalLigne;
			}

			existing.MontantHT = montantHT;
			existing.MontantTTC = montantHT * 1.2m; // Assuming 20% VAT

			var updated = await _dao.UpdateAsync(existing);
			return Success(MapToDTO(updated));
		}

		public async Task<ClientApiResponse<bool>> DeleteAsync(int id)
		{
			// Check if commande can be deleted (only if in draft status)
			var commande = await _dao.GetByIdAsync(id);
			if (commande == null) return Failure<bool>("Commande de vente introuvable");

			if (commande.Statut != "Brouillon")
				return Failure<bool>("Seules les commandes en brouillon peuvent être supprimées");

			var ok = await _dao.DeleteAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<ClientApiResponse<CommandeVenteDTO>> SubmitAsync(int commandeId)
		{
			var commande = await _dao.GetByIdAsync(commandeId);
			if (commande == null) return Failure<CommandeVenteDTO>("Commande de vente introuvable");

			if (commande.Statut != "Brouillon")
				return Failure<CommandeVenteDTO>("Seule une commande en brouillon peut être soumise");

			commande.Statut = "Confirmé";
			var updated = await _dao.UpdateAsync(commande);
			return Success(MapToDTO(updated));
		}

		// Sales Quote operations
		public async Task<ClientApiResponse<DevisListResponse>> GetAllDevisAsync(int page, int pageSize)
		{
			var (items, total) = await _dao.GetAllDevisAsync(page, pageSize);
			var dtos = items.Select(MapToDTO).ToList();
			return Success(new DevisListResponse
			{
				Devis = dtos,
				TotalCount = total,
				Page = page,
				PageSize = pageSize,
				TotalPages = (int)Math.Ceiling(total / (double)pageSize),
				HasNextPage = page * pageSize < total,
				HasPreviousPage = page > 1
			});
		}

		public async Task<ClientApiResponse<DevisListResponse>> SearchDevisAsync(DevisSearchRequest request)
		{
			var (items, total) = await _dao.SearchDevisAsync(
				request.ClientId,
				request.Statut,
				request.DateDebut,
				request.DateFin,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new DevisListResponse
			{
				Devis = dtos,
				TotalCount = total,
				Page = request.Page,
				PageSize = request.PageSize,
				TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
				HasNextPage = request.Page * request.PageSize < total,
				HasPreviousPage = request.Page > 1
			});
		}

		public async Task<ClientApiResponse<DevisDTO>> GetDevisByIdAsync(int id)
		{
			var devis = await _dao.GetDevisByIdAsync(id);
			if (devis == null) return Failure<DevisDTO>("Devis introuvable");
			return Success(MapToDTO(devis));
		}

		public async Task<ClientApiResponse<DevisDTO>> CreateDevisAsync(CreateDevisRequest request)
		{
			try
			{
				Debug.WriteLine($"CreateDevisAsync called with ClientId: {request.ClientId}");
				Debug.WriteLine($"Request data: Lignes count={request.Lignes?.Count() ?? 0}");

				var entity = new Devis
				{
					ClientId = request.ClientId,
					DateCreation = DateTime.Now,
					DateExpiration = request.DateExpiration,
					Statut = "Brouillon", // Default status
					Remise = request.Remise,
					Lignes = new List<LigneDevis>()
				};

				// Calculate amounts and create line items
				decimal montantHT = 0;
				foreach (var ligneRequest in request.Lignes)
				{
					var produit = await _productDAO.GetByIdAsync(ligneRequest.ProduitId);
					if (produit == null) continue; // Skip invalid products

					var ligne = new LigneDevis
					{
						ProduitId = ligneRequest.ProduitId,
						Quantite = ligneRequest.Quantite,
						PrixUnitaire = ligneRequest.PrixUnitaire,
						TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaire
					};

					entity.Lignes.Add(ligne);
					montantHT += ligne.TotalLigne;
				}

				// Apply discount
				montantHT -= entity.Remise;
				entity.MontantHT = montantHT;
				entity.MontantTTC = montantHT * 1.2m; // Assuming 20% VAT

				var created = await _dao.CreateDevisAsync(entity);
				return Success(MapToDTO(created));
			}
			catch (Exception ex)
			{
				Debug.WriteLine($"Exception in CreateDevisAsync: {ex}");
				return Failure<DevisDTO>($"Erreur interne du serveur: {ex.Message}");
			}
		}

		public async Task<ClientApiResponse<DevisDTO>> UpdateDevisAsync(int id, UpdateDevisRequest request)
		{
			var existing = await _dao.GetDevisByIdAsync(id);
			if (existing == null) return Failure<DevisDTO>("Devis introuvable");

			existing.ClientId = request.ClientId;
			existing.DateExpiration = request.DateExpiration;
			existing.Remise = request.Remise;

			// Recalculate amounts
			decimal montantHT = 0;
			foreach (var ligneRequest in request.Lignes)
			{
				var produit = await _productDAO.GetByIdAsync(ligneRequest.ProduitId);
				if (produit == null) continue; // Skip invalid products

				var ligne = new LigneDevis
				{
					ProduitId = ligneRequest.ProduitId,
					Quantite = ligneRequest.Quantite,
					PrixUnitaire = ligneRequest.PrixUnitaire,
					TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaire
				};

				montantHT += ligne.TotalLigne;
			}

			// Apply discount
			montantHT -= existing.Remise;
			existing.MontantHT = montantHT;
			existing.MontantTTC = montantHT * 1.2m; // Assuming 20% VAT

			var updated = await _dao.UpdateDevisAsync(existing);
			return Success(MapToDTO(updated));
		}

		public async Task<ClientApiResponse<bool>> DeleteDevisAsync(int id)
		{
			// Check if devis can be deleted (only if in draft status)
			var devis = await _dao.GetDevisByIdAsync(id);
			if (devis == null) return Failure<bool>("Devis introuvable");

			if (devis.Statut != "Brouillon")
				return Failure<bool>("Seuls les devis en brouillon peuvent être supprimés");

			var ok = await _dao.DeleteDevisAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<ClientApiResponse<DevisDTO>> SubmitDevisAsync(int devisId)
		{
			var devis = await _dao.GetDevisByIdAsync(devisId);
			if (devis == null) return Failure<DevisDTO>("Devis introuvable");

			if (devis.Statut != "Brouillon")
				return Failure<DevisDTO>("Seul un devis en brouillon peut être soumis");

			devis.Statut = "Envoyé";
			var updated = await _dao.UpdateDevisAsync(devis);
			return Success(MapToDTO(updated));
		}

		public async Task<ClientApiResponse<DevisDTO>> AcceptDevisAsync(int devisId)
		{
			var devis = await _dao.GetDevisByIdAsync(devisId);
			if (devis == null) return Failure<DevisDTO>("Devis introuvable");

			if (devis.Statut != "Envoyé")
				return Failure<DevisDTO>("Seul un devis envoyé peut être accepté");

			devis.Statut = "Accepté";
			var updated = await _dao.UpdateDevisAsync(devis);
			return Success(MapToDTO(updated));
		}

		// Mapping functions
		private static CommandeVenteDTO MapToDTO(CommandeVente c)
		{
			return new CommandeVenteDTO
			{
				Id = c.Id,
				ClientId = c.ClientId,
				Client = c.Client != null ? new ClientDTO
				{
					Id = c.Client.Id,
					Nom = c.Client.Nom ?? "",
					Prenom = c.Client.Prenom ?? "",
					RaisonSociale = c.Client.RaisonSociale ?? "",
					TypeClient = c.Client.TypeClient ?? "",
					ICE = c.Client.ICE ?? "",
					Adresse = c.Client.Adresse ?? "",
					Ville = c.Client.Ville ?? "",
					CodePostal = c.Client.CodePostal ?? "",
					Pays = c.Client.Pays ?? "",
					Telephone = c.Client.Telephone ?? "",
					Email = c.Client.Email ?? "",
					Classification = c.Client.Classification ?? "",
					LimiteCredit = c.Client.LimiteCredit,
					SoldeActuel = c.Client.SoldeActuel,
					EstActif = c.Client.EstActif,
					DateCreation = c.Client.DateCreation
				} : null,
				DevisId = c.DevisId, // Fixed: removed the ?? 0 since it's now nullable
				DateCommande = c.DateCommande,
				Statut = c.Statut ?? "",
				MontantHT = c.MontantHT,
				MontantTTC = c.MontantTTC,
				ModeLivraison = c.ModeLivraison ?? "",
				ConditionsPaiement = c.ConditionsPaiement ?? "",
				Lignes = c.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneCommandeVenteDTO>(),
				Livraisons = c.Livraisons?.Select(MapToDTO).ToList() ?? new List<LivraisonDTO>(),
				Factures = c.Factures?.Select(MapToDTO).ToList() ?? new List<FactureVenteDTO>()
			};
		}

		private static LigneCommandeVenteDTO MapToDTO(LigneCommandeVente l)
		{
			return new LigneCommandeVenteDTO
			{
				Id = l.Id,
				CommandeId = l.CommandeId,
				ProduitId = l.ProduitId,
				Produit = l.Produit != null ? new ProductDTO
				{
					Id = l.Produit.Id,
					Reference = l.Produit.Reference ?? "",
					Designation = l.Produit.Designation ?? "",
					Description = l.Produit.Description ?? "",
					Categorie = l.Produit.Categorie ?? "",
					SousCategorie = l.Produit.SousCategorie ?? "",
					PrixAchat = l.Produit.PrixAchat,
					PrixVente = l.Produit.PrixVente,
					PrixVenteMin = l.Produit.PrixVenteMin,
					Unite = l.Produit.Unite ?? "",
					Statut = l.Produit.Statut ?? "",
					StockActuel = l.Produit.StockActuel,
					StockMinimum = l.Produit.StockMinimum,
					StockMaximum = l.Produit.StockMaximum
				} : null,
				Quantite = l.Quantite,
				PrixUnitaire = l.PrixUnitaire,
				TotalLigne = l.TotalLigne
			};
		}

		private static LivraisonDTO MapToDTO(Livraison l)
		{
			return new LivraisonDTO
			{
				Id = l.Id,
				CommandeId = l.CommandeId,
				DateLivraison = l.DateLivraison,
				Statut = l.Statut ?? "",
				Transportateur = l.Transportateur ?? "",
				NumeroSuivi = l.NumeroSuivi ?? "",
				Lignes = l.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneLivraisonDTO>()
			};
		}

		private static LigneLivraisonDTO MapToDTO(LigneLivraison ll)
		{
			return new LigneLivraisonDTO
			{
				Id = ll.Id,
				LivraisonId = ll.LivraisonId,
				ProduitId = ll.ProduitId,
				Produit = null, // Will be populated if needed
				Quantite = ll.Quantite
			};
		}

		private static FactureVenteDTO MapToDTO(FactureVente f)
		{
			return new FactureVenteDTO
			{
				Id = f.Id,
				CommandeId = f.CommandeId,
				ClientId = f.ClientId,
				DateFacture = f.DateFacture,
				DateEcheance = f.DateEcheance,
				Statut = f.Statut ?? "",
				MontantHT = f.MontantHT,
				MontantTTC = f.MontantTTC,
				MontantPaye = f.MontantPaye,
				Lignes = f.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneFactureVenteDTO>(),
				Retours = f.Retours?.Select(MapToDTO).ToList() ?? new List<RetourVenteDTO>(),
				Paiements = f.Paiements?.Select(MapToDTO).ToList() ?? new List<PaiementClientDTO>()
			};
		}

		private static LigneFactureVenteDTO MapToDTO(LigneFactureVente lf)
		{
			return new LigneFactureVenteDTO
			{
				Id = lf.Id,
				FactureId = lf.FactureId,
				ProduitId = lf.ProduitId,
				Produit = null, // Will be populated if needed
				Quantite = lf.Quantite,
				PrixUnitaire = lf.PrixUnitaire,
				TotalLigne = lf.TotalLigne
			};
		}

		private static RetourVenteDTO MapToDTO(RetourVente r)
		{
			return new RetourVenteDTO
			{
				Id = r.Id,
				FactureId = r.FactureId,
				ClientId = r.ClientId,
				DateRetour = r.DateRetour,
				Motif = r.Motif ?? "",
				Statut = r.Statut ?? "",
				Lignes = r.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneRetourVenteDTO>()
			};
		}

		private static LigneRetourVenteDTO MapToDTO(LigneRetourVente lr)
		{
			return new LigneRetourVenteDTO
			{
				Id = lr.Id,
				RetourId = lr.RetourId,
				ProduitId = lr.ProduitId,
				Produit = null, // Will be populated if needed
				Quantite = lr.Quantite
			};
		}

		private static DevisDTO MapToDTO(Devis d)
		{
			return new DevisDTO
			{
				Id = d.Id,
				ClientId = d.ClientId,
				Client = d.Client != null ? new ClientDTO
				{
					Id = d.Client.Id,
					Nom = d.Client.Nom ?? "",
					Prenom = d.Client.Prenom ?? "",
					RaisonSociale = d.Client.RaisonSociale ?? "",
					TypeClient = d.Client.TypeClient ?? "",
					ICE = d.Client.ICE ?? "",
					Adresse = d.Client.Adresse ?? "",
					Ville = d.Client.Ville ?? "",
					CodePostal = d.Client.CodePostal ?? "",
					Pays = d.Client.Pays ?? "",
					Telephone = d.Client.Telephone ?? "",
					Email = d.Client.Email ?? "",
					Classification = d.Client.Classification ?? "",
					LimiteCredit = d.Client.LimiteCredit,
					SoldeActuel = d.Client.SoldeActuel,
					EstActif = d.Client.EstActif,
					DateCreation = d.Client.DateCreation
				} : null,
				DateCreation = d.DateCreation,
				DateExpiration = d.DateExpiration,
				Statut = d.Statut ?? "",
				MontantHT = d.MontantHT,
				MontantTTC = d.MontantTTC,
				Remise = d.Remise,
				Lignes = d.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneDevisDTO>()
			};
		}

		private static LigneDevisDTO MapToDTO(LigneDevis ld)
		{
			return new LigneDevisDTO
			{
				Id = ld.Id,
				DevisId = ld.DevisId,
				ProduitId = ld.ProduitId,
				Produit = ld.Produit != null ? new ProductDTO
				{
					Id = ld.Produit.Id,
					Reference = ld.Produit.Reference ?? "",
					Designation = ld.Produit.Designation ?? "",
					Description = ld.Produit.Description ?? "",
					Categorie = ld.Produit.Categorie ?? "",
					SousCategorie = ld.Produit.SousCategorie ?? "",
					PrixAchat = ld.Produit.PrixAchat,
					PrixVente = ld.Produit.PrixVente,
					PrixVenteMin = ld.Produit.PrixVenteMin,
					Unite = ld.Produit.Unite ?? "",
					Statut = ld.Produit.Statut ?? "",
					StockActuel = ld.Produit.StockActuel,
					StockMinimum = ld.Produit.StockMinimum,
					StockMaximum = ld.Produit.StockMaximum
				} : null,
				Quantite = ld.Quantite,
				PrixUnitaire = ld.PrixUnitaire,
				TotalLigne = ld.TotalLigne
			};
		}

		private static PaiementClientDTO MapToDTO(PaiementClient p)
		{
			return new PaiementClientDTO
			{
				Id = p.Id,
				FactureId = p.FactureId,
				ClientId = p.ClientId,
				DatePaiement = p.DatePaiement,
				Montant = p.Montant,
				MethodePaiement = p.MethodePaiement ?? "",
				Reference = p.Reference ?? "",
				Statut = p.Statut ?? ""
			};
		}

		// Helper methods
		private static ClientApiResponse<T> Success<T>(T data)
		{
			return new ClientApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow };
		}

		private static ClientApiResponse<T> Failure<T>(string message)
		{
			return new ClientApiResponse<T> { Success = false, Message = message, Data = default(T), Timestamp = DateTime.UtcNow };
		}
	}

	// Search request DTOs
	public class CommandeVenteSearchRequest
	{
		public int? ClientId { get; set; }
		public string? Statut { get; set; }
		public DateTime? DateDebut { get; set; }
		public DateTime? DateFin { get; set; }
		public int Page { get; set; } = 1;
		public int PageSize { get; set; } = 50;
		public string SortBy { get; set; } = "DateCommande";
		public string SortDirection { get; set; } = "Desc";
	}

	public class DevisSearchRequest
	{
		public int? ClientId { get; set; }
		public string? Statut { get; set; }
		public DateTime? DateDebut { get; set; }
		public DateTime? DateFin { get; set; }
		public int Page { get; set; } = 1;
		public int PageSize { get; set; } = 50;
		public string SortBy { get; set; } = "DateCreation";
		public string SortDirection { get; set; } = "Desc";
	}
}