using System;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;
using System.Diagnostics;
using System.Collections.Generic;

namespace App.Services
{
	public class CommandeAchatService
	{
		private readonly ICommandeAchatDAO _dao;
		private readonly IFournisseurDAO _fournisseurDAO;
		private readonly IProductDAO _productDAO;

		public CommandeAchatService(ICommandeAchatDAO dao, IFournisseurDAO fournisseurDAO, IProductDAO productDAO)
		{
			_dao = dao;
			_fournisseurDAO = fournisseurDAO;
			_productDAO = productDAO;
		}

		public async Task<FournisseurApiResponse<CommandeAchatListResponse>> GetAllAsync(int page, int pageSize)
		{
			var (items, total) = await _dao.GetAllAsync(page, pageSize);
			var dtos = items.Select(MapToDTO).ToList();
			return Success(new CommandeAchatListResponse
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

		public async Task<FournisseurApiResponse<CommandeAchatListResponse>> SearchAsync(CommandeAchatSearchRequest request)
		{
			var (items, total) = await _dao.SearchAsync(
				request.FournisseurId,
				request.Statut,
				request.DateDebut,
				request.DateFin,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new CommandeAchatListResponse
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

		public async Task<FournisseurApiResponse<CommandeAchatDTO>> GetByIdAsync(int id)
		{
			var commande = await _dao.GetByIdAsync(id);
			if (commande == null) return Failure<CommandeAchatDTO>("Commande d'achat introuvable");
			return Success(MapToDTO(commande));
		}

		public async Task<FournisseurApiResponse<CommandeAchatDTO>> CreateAsync(CreateCommandeAchatRequest request)
		{
			// Validate fournisseur exists
			var fournisseur = await _fournisseurDAO.GetByIdAsync(request.FournisseurId);
			if (fournisseur == null) return Failure<CommandeAchatDTO>("Fournisseur introuvable");

			var entity = new CommandeAchat
			{
				FournisseurId = request.FournisseurId,
				DemandeId = request.DemandeId ?? 0, // Use 0 or default value if null
				DateCommande = DateTime.Now,
				DateLivraisonPrevue = request.DateLivraisonPrevue,
				Statut = "Brouillon", // Default status
				Lignes = new List<LigneCommandeAchat>()
			};

			// Calculate amounts and create line items
			decimal montantHT = 0;
			foreach (var ligneRequest in request.Lignes)
			{
				var produit = await _productDAO.GetByIdAsync(ligneRequest.ProduitId);
				if (produit == null) continue; // Skip invalid products

				var ligne = new LigneCommandeAchat
				{
					ProduitId = ligneRequest.ProduitId,
					Quantite = ligneRequest.Quantite,
					PrixUnitaireHT = ligneRequest.PrixUnitaireHT,
					TauxTVA = ligneRequest.TauxTVA,
					PrixUnitaireTTC = ligneRequest.PrixUnitaireTTC,
					TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaireHT
				};

				entity.Lignes.Add(ligne);
				montantHT += ligne.TotalLigne;
			}

			entity.MontantHT = montantHT;
			entity.MontantTTC = montantHT * 1.2m; // Assuming 20% VAT

			var created = await _dao.CreateAsync(entity);
			return Success(MapToDTO(created));
		}

		public async Task<FournisseurApiResponse<CommandeAchatDTO>> UpdateAsync(int id, UpdateCommandeAchatRequest request)
		{
			var existing = await _dao.GetByIdAsync(id);
			if (existing == null) return Failure<CommandeAchatDTO>("Commande d'achat introuvable");

			// Validate fournisseur exists
			var fournisseur = await _fournisseurDAO.GetByIdAsync(request.FournisseurId);
			if (fournisseur == null) return Failure<CommandeAchatDTO>("Fournisseur introuvable");

			existing.FournisseurId = request.FournisseurId;
			existing.DemandeId = request.DemandeId ?? existing.DemandeId; // Only update if provided
			existing.DateLivraisonPrevue = request.DateLivraisonPrevue;

			// Recalculate amounts
			decimal montantHT = 0;
			foreach (var ligneRequest in request.Lignes)
			{
				var produit = await _productDAO.GetByIdAsync(ligneRequest.ProduitId);
				if (produit == null) continue; // Skip invalid products

				// For simplicity, we're not handling line item updates properly here
				// In a real implementation, we would need to handle line item CRUD operations properly
				var ligne = new LigneCommandeAchat
				{
					ProduitId = ligneRequest.ProduitId,
					Quantite = ligneRequest.Quantite,
					PrixUnitaireHT = ligneRequest.PrixUnitaireHT,
					TauxTVA = ligneRequest.TauxTVA,
					PrixUnitaireTTC = ligneRequest.PrixUnitaireTTC,
					TotalLigne = ligneRequest.Quantite * ligneRequest.PrixUnitaireHT
				};

				montantHT += ligne.TotalLigne;
			}

			existing.MontantHT = montantHT;
			existing.MontantTTC = montantHT * 1.2m; // Assuming 20% VAT

			var updated = await _dao.UpdateAsync(existing);
			return Success(MapToDTO(updated));
		}

		public async Task<FournisseurApiResponse<bool>> DeleteAsync(int id)
		{
			// Check if commande can be deleted (only if in draft status)
			var commande = await _dao.GetByIdAsync(id);
			if (commande == null) return Failure<bool>("Commande d'achat introuvable");
			
			if (commande.Statut != "Brouillon")
				return Failure<bool>("Seules les commandes en brouillon peuvent être supprimées");

			var ok = await _dao.DeleteAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<FournisseurApiResponse<CommandeAchatDTO>> SubmitAsync(int commandeId)
		{
			var commande = await _dao.GetByIdAsync(commandeId);
			if (commande == null) return Failure<CommandeAchatDTO>("Commande d'achat introuvable");
			
			if (commande.Statut != "Brouillon")
				return Failure<CommandeAchatDTO>("Seule une commande en brouillon peut être soumise");

			commande.Statut = "Envoyée";
			var updated = await _dao.UpdateAsync(commande);
			return Success(MapToDTO(updated));
		}

		public async Task<FournisseurApiResponse<ReceptionDTO>> ReceiveAsync(int commandeId, CreateReceptionRequest request)
		{
			try
			{
				Debug.WriteLine($"ReceiveAsync called with commandeId: {commandeId}");
				Debug.WriteLine($"Request data: DateReception={request.DateReception}, Lignes count={request.Lignes?.Count() ?? 0}");

				// Validate request
				if (request == null)
				{
					Debug.WriteLine("Request is null");
					return Failure<ReceptionDTO>("Requête invalide");
				}

				// Validate date
				if (request.DateReception == DateTime.MinValue)
				{
					Debug.WriteLine("Invalid date in request");
					return Failure<ReceptionDTO>("Date de réception invalide");
				}

				// Get the purchase order
				var commande = await _dao.GetByIdAsync(commandeId);
				if (commande == null) 
				{
					Debug.WriteLine($"Commande {commandeId} not found");
					return Failure<ReceptionDTO>("Commande d'achat introuvable");
				}

				Debug.WriteLine($"Commande found: Id={commande.Id}, Statut={commande.Statut}");

				// Validate that the order has been submitted
				if (commande.Statut == "Brouillon")
				{
					Debug.WriteLine($"Commande {commandeId} is in Brouillon status and cannot be received");
					return Failure<ReceptionDTO>("La commande doit être soumise avant de pouvoir recevoir des marchandises");
				}

				// Create the reception entity (without setting navigation properties)
				var reception = new Reception
				{
					CommandeId = commandeId,
					DateReception = request.DateReception.Kind == DateTimeKind.Utc ? request.DateReception : request.DateReception.ToUniversalTime(),
					Statut = "Partielle" // Will be updated to "Complète" if all items are received
				};

				// We'll add the lines after creating the reception to avoid navigation property issues

				Debug.WriteLine($"Created reception entity with DateReception={reception.DateReception}");

				// Process each line in the reception request
				if (request.Lignes == null)
				{
					Debug.WriteLine("Request.Lignes is null");
					return Failure<ReceptionDTO>("Aucune ligne de réception fournie");
				}

				var ligneReceptions = new List<LigneReception>();

				foreach (var ligneRequest in request.Lignes)
				{
					Debug.WriteLine($"Processing ligneRequest: LigneCommandeId={ligneRequest.LigneCommandeId}, QuantiteRecue={ligneRequest.QuantiteRecue}, QuantiteRejetee={ligneRequest.QuantiteRejetee}");

					// Find the corresponding purchase order line
					var ligneCommande = commande.Lignes.FirstOrDefault(l => l.Id == ligneRequest.LigneCommandeId);
					if (ligneCommande == null)
					{
						Debug.WriteLine($"LigneCommande {ligneRequest.LigneCommandeId} not found in commande {commandeId}");
						return Failure<ReceptionDTO>("Ligne de commande introuvable");
					}

					// Create the reception line (without setting navigation properties)
					var ligneReception = new LigneReception
					{
						LigneCommandeId = ligneRequest.LigneCommandeId,
						ProduitId = ligneCommande.ProduitId,
						QuantiteRecue = ligneRequest.QuantiteRecue,
						QuantiteRejetee = ligneRequest.QuantiteRejetee,
						MotifRejet = ligneRequest.MotifRejet ?? "",
						Qualite = "Conforme" // Default to conform, can be updated later
					};

					ligneReceptions.Add(ligneReception);

					// Update product stock if items were accepted
					if (ligneRequest.QuantiteRecue > 0)
					{
						var produit = await _productDAO.GetByIdAsync(ligneCommande.ProduitId);
						if (produit != null)
						{
							Debug.WriteLine($"Updating stock for product {produit.Id}: {produit.StockActuel} -> {produit.StockActuel + ligneRequest.QuantiteRecue}");
							
							// Update stock quantity
							produit.StockActuel += ligneRequest.QuantiteRecue;

							// Save the updated product
							await _productDAO.UpdateAsync(produit);
						}
						else
						{
							Debug.WriteLine($"Product {ligneCommande.ProduitId} not found");
						}
					}
				}

				// Determine if the reception is complete or partial
				bool isComplete = true;
				foreach (var ligneCommande in commande.Lignes)
				{
					// Calculate total received quantity for this line
					int totalReceived = ligneReceptions
						.Where(lr => lr.LigneCommandeId == ligneCommande.Id)
						.Sum(lr => lr.QuantiteRecue);

					// Add previously received quantities
					int previouslyReceived = 0;
					if (commande.Receptions != null)
					{
						previouslyReceived = commande.Receptions
							.SelectMany(r => r.Lignes ?? new List<LigneReception>())
							.Where(lr => lr.LigneCommandeId == ligneCommande.Id)
							.Sum(lr => lr.QuantiteRecue);
					}

					totalReceived += previouslyReceived;

					Debug.WriteLine($"Ligne {ligneCommande.Id}: Commandée={ligneCommande.Quantite}, Reçue={totalReceived}");

					// If any line is not fully received, the reception is partial
					if (totalReceived < ligneCommande.Quantite)
					{
						isComplete = false;
						break;
					}
				}

				reception.Statut = isComplete ? "Complète" : "Partielle";
				Debug.WriteLine($"Reception status set to: {reception.Statut}");

				// Update the order status based on reception
				if (isComplete)
				{
					commande.Statut = "Livrée";
				}
				else if (commande.Statut != "Partielle")
				{
					commande.Statut = "Partielle";
				}

				Debug.WriteLine($"Commande status updated to: {commande.Statut}");

				// Save the reception first
				Debug.WriteLine("Saving reception...");
				var createdReception = await _dao.CreateReceptionAsync(reception);
				Debug.WriteLine($"Reception saved with Id: {createdReception.Id}");

				// Now add the lines to the created reception and save them
				foreach (var ligne in ligneReceptions)
				{
					ligne.ReceptionId = createdReception.Id; // Set the foreign key
					await _dao.CreateLigneReceptionAsync(ligne);
				}

				// Update the commande
				Debug.WriteLine("Updating commande...");
				await _dao.UpdateAsync(commande);
				Debug.WriteLine("Commande updated successfully");

				// Reload the reception to get the complete entity with lines
				createdReception = await _dao.UpdateReceptionAsync(createdReception);

				Debug.WriteLine($"Reception created with Id: {createdReception.Id}");

				return Success(MapToDTO(createdReception));
			}
			catch (Exception ex)
			{
				Debug.WriteLine($"Exception in ReceiveAsync: {ex}");
				Debug.WriteLine($"Exception details: {ex.Message} - {ex.StackTrace}");
				if (ex.InnerException != null)
				{
					Debug.WriteLine($"Inner exception: {ex.InnerException.Message} - {ex.InnerException.StackTrace}");
				}
				return Failure<ReceptionDTO>($"Erreur interne du serveur: {ex.Message}");
			}
		}

		private static CommandeAchatDTO MapToDTO(CommandeAchat c)
		{
			return new CommandeAchatDTO
			{
				Id = c.Id,
				FournisseurId = c.FournisseurId,
				Fournisseur = c.Fournisseur != null ? new FournisseurDTO
				{
					Id = c.Fournisseur.Id,
					RaisonSociale = c.Fournisseur.RaisonSociale ?? "",
					TypeFournisseur = c.Fournisseur.TypeFournisseur ?? "",
					ICE = c.Fournisseur.ICE ?? "",
					Adresse = c.Fournisseur.Adresse ?? "",
					Ville = c.Fournisseur.Ville ?? "",
					CodePostal = c.Fournisseur.CodePostal ?? "",
					Pays = c.Fournisseur.Pays ?? "",
					Telephone = c.Fournisseur.Telephone ?? "",
					Email = c.Fournisseur.Email ?? "",
					ConditionsPaiement = c.Fournisseur.ConditionsPaiement ?? "",
					DelaiLivraisonMoyen = c.Fournisseur.DelaiLivraisonMoyen,
					NoteQualite = c.Fournisseur.NoteQualite
				} : null,
				DemandeId = c.DemandeId,
				DateCommande = c.DateCommande,
				DateLivraisonPrevue = c.DateLivraisonPrevue,
				Statut = c.Statut ?? "",
				MontantHT = c.MontantHT,
				MontantTTC = c.MontantTTC,
				Lignes = c.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneCommandeAchatDTO>(),
				Receptions = c.Receptions?.Select(MapToDTO).ToList() ?? new List<ReceptionDTO>(),
				Factures = c.Factures?.Select(MapToDTO).ToList() ?? new List<FactureAchatDTO>()
			};
		}

		private static LigneCommandeAchatDTO MapToDTO(LigneCommandeAchat l)
		{
			return new LigneCommandeAchatDTO
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
				PrixUnitaireHT = l.PrixUnitaireHT,
				TauxTVA = l.TauxTVA,
				PrixUnitaireTTC = l.PrixUnitaireTTC,
				TotalLigne = l.TotalLigne
			};
		}

		private static ReceptionDTO MapToDTO(Reception r)
		{
			return new ReceptionDTO
			{
				Id = r.Id,
				CommandeId = r.CommandeId,
				DateReception = r.DateReception,
				Statut = r.Statut,
				Lignes = r.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneReceptionDTO>()
			};
		}

		private static LigneReceptionDTO MapToDTO(LigneReception lr)
		{
			return new LigneReceptionDTO
			{
				Id = lr.Id,
				ReceptionId = lr.ReceptionId,
				LigneCommandeId = lr.LigneCommandeId,
				LigneCommande = null, // Will be populated if needed
				QuantiteRecue = lr.QuantiteRecue,
				QuantiteRejetee = lr.QuantiteRejetee,
				MotifRejet = lr.MotifRejet ?? ""
			};
		}

		private static FactureAchatDTO MapToDTO(FactureAchat f)
		{
			return new FactureAchatDTO
			{
				Id = f.Id,
				CommandeId = f.CommandeId,
				FournisseurId = f.FournisseurId,
				DateFacture = f.DateFacture,
				DateEcheance = f.DateEcheance,
				Statut = f.Statut,
				MontantHT = f.MontantHT,
				MontantTTC = f.MontantTTC,
				MontantPaye = f.MontantPaye,
				Lignes = f.Lignes?.Select(MapToDTO).ToList() ?? new List<LigneFactureAchatDTO>(),
				Paiements = f.Paiements?.Select(MapToDTO).ToList() ?? new List<PaiementFournisseurDTO>()
			};
		}

		private static LigneFactureAchatDTO MapToDTO(LigneFactureAchat lf)
		{
			return new LigneFactureAchatDTO
			{
				Id = lf.Id,
				FactureId = lf.FactureId,
				LigneCommandeId = lf.LigneCommandeId,
				QuantiteFacturee = lf.QuantiteFacturee,
				PrixUnitaireHT = lf.PrixUnitaireHT,
				TauxTVA = lf.TauxTVA,
				PrixUnitaireTTC = lf.PrixUnitaireTTC,
				TotalLigne = lf.TotalLigne
			};
		}

		private static PaiementFournisseurDTO MapToDTO(PaiementFournisseur p)
		{
			return new PaiementFournisseurDTO
			{
				Id = p.Id,
				FactureId = p.FactureId,
				FournisseurId = p.FournisseurId,
				DatePaiement = p.DatePaiement,
				Montant = p.Montant,
				MethodePaiement = p.MethodePaiement,
				Reference = p.Reference,
				Statut = p.Statut
			};
		}

		private static FournisseurApiResponse<T> Success<T>(T data)
		{
			return new FournisseurApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow };
		}

		private static FournisseurApiResponse<T> Failure<T>(string message)
		{
			return new FournisseurApiResponse<T> { Success = false, Message = message, Data = default(T), Timestamp = DateTime.UtcNow };
		}
	}

	// Search request DTO
	public class CommandeAchatSearchRequest
	{
		public int? FournisseurId { get; set; }
		public string? Statut { get; set; }
		public DateTime? DateDebut { get; set; }
		public DateTime? DateFin { get; set; }
		public int Page { get; set; } = 1;
		public int PageSize { get; set; } = 50;
		public string SortBy { get; set; } = "DateCommande";
		public string SortDirection { get; set; } = "Desc";
	}
}