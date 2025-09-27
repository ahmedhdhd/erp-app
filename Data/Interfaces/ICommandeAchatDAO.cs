using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
	public interface ICommandeAchatDAO
	{
		Task<(IEnumerable<CommandeAchat> Items, int TotalCount)> GetAllAsync(int page, int pageSize);
		Task<(IEnumerable<CommandeAchat> Items, int TotalCount)> SearchAsync(
			int? fournisseurId,
			string? statut,
			DateTime? dateDebut,
			DateTime? dateFin,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<CommandeAchat?> GetByIdAsync(int id);
		Task<CommandeAchat> CreateAsync(CommandeAchat entity);
		Task<CommandeAchat> UpdateAsync(CommandeAchat entity);
		Task<bool> DeleteAsync(int id);
		
		// LigneCommandeAchat operations
		Task<LigneCommandeAchat> CreateLigneAsync(LigneCommandeAchat entity);
		Task<LigneCommandeAchat?> UpdateLigneAsync(LigneCommandeAchat entity);
		Task<bool> DeleteLigneAsync(int id);
		
		// Reception operations
		Task<Reception> CreateReceptionAsync(Reception entity);
		Task<Reception?> UpdateReceptionAsync(Reception entity);
		Task<bool> DeleteReceptionAsync(int id);
		
		// LigneReception operations
		Task<LigneReception> CreateLigneReceptionAsync(LigneReception entity);
		Task<LigneReception?> UpdateLigneReceptionAsync(LigneReception entity);
		Task<bool> DeleteLigneReceptionAsync(int id);
		
		// FactureAchat operations
		Task<FactureAchat> CreateFactureAsync(FactureAchat entity);
		Task<FactureAchat?> UpdateFactureAsync(FactureAchat entity);
		Task<bool> DeleteFactureAsync(int id);
		
		// LigneFactureAchat operations
		Task<LigneFactureAchat> CreateLigneFactureAsync(LigneFactureAchat entity);
		Task<LigneFactureAchat?> UpdateLigneFactureAsync(LigneFactureAchat entity);
		Task<bool> DeleteLigneFactureAsync(int id);
	}
}