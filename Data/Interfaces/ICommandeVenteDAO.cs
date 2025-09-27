using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
	public interface ICommandeVenteDAO
	{
		// Sales Order operations
		Task<(IEnumerable<CommandeVente> Items, int TotalCount)> GetAllAsync(int page, int pageSize);
		Task<(IEnumerable<CommandeVente> Items, int TotalCount)> SearchAsync(
			int? clientId,
			string? statut,
			DateTime? dateDebut,
			DateTime? dateFin,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<CommandeVente?> GetByIdAsync(int id);
		Task<CommandeVente> CreateAsync(CommandeVente entity);
		Task<CommandeVente> UpdateAsync(CommandeVente entity);
		Task<bool> DeleteAsync(int id);

		// Sales Quote operations
		Task<(IEnumerable<Devis> Items, int TotalCount)> GetAllDevisAsync(int page, int pageSize);
		Task<(IEnumerable<Devis> Items, int TotalCount)> SearchDevisAsync(
			int? clientId,
			string? statut,
			DateTime? dateDebut,
			DateTime? dateFin,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<Devis?> GetDevisByIdAsync(int id);
		Task<Devis> CreateDevisAsync(Devis entity);
		Task<Devis> UpdateDevisAsync(Devis entity);
		Task<bool> DeleteDevisAsync(int id);

		// Sales Order Line operations
		Task<LigneCommandeVente> CreateLigneCommandeAsync(LigneCommandeVente entity);
		Task<LigneCommandeVente?> UpdateLigneCommandeAsync(LigneCommandeVente entity);
		Task<bool> DeleteLigneCommandeAsync(int id);

		// Delivery operations
		Task<Livraison> CreateLivraisonAsync(Livraison entity);
		Task<Livraison?> UpdateLivraisonAsync(Livraison entity);
		Task<bool> DeleteLivraisonAsync(int id);

		// Delivery Line operations
		Task<LigneLivraison> CreateLigneLivraisonAsync(LigneLivraison entity);
		Task<LigneLivraison?> UpdateLigneLivraisonAsync(LigneLivraison entity);
		Task<bool> DeleteLigneLivraisonAsync(int id);

		// Sales Invoice operations
		Task<FactureVente> CreateFactureAsync(FactureVente entity);
		Task<FactureVente?> UpdateFactureAsync(FactureVente entity);
		Task<bool> DeleteFactureAsync(int id);

		// Sales Invoice Line operations
		Task<LigneFactureVente> CreateLigneFactureAsync(LigneFactureVente entity);
		Task<LigneFactureVente?> UpdateLigneFactureAsync(LigneFactureVente entity);
		Task<bool> DeleteLigneFactureAsync(int id);

		// Sales Return operations
		Task<RetourVente> CreateRetourAsync(RetourVente entity);
		Task<RetourVente?> UpdateRetourAsync(RetourVente entity);
		Task<bool> DeleteRetourAsync(int id);

		// Sales Return Line operations
		Task<LigneRetourVente> CreateLigneRetourAsync(LigneRetourVente entity);
		Task<LigneRetourVente?> UpdateLigneRetourAsync(LigneRetourVente entity);
		Task<bool> DeleteLigneRetourAsync(int id);
	}
}