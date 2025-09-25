using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
	public interface IFournisseurDAO
	{
		Task<(IEnumerable<Fournisseur> Items, int TotalCount)> GetAllAsync(int page, int pageSize);
		Task<(IEnumerable<Fournisseur> Items, int TotalCount)> SearchAsync(
			string? searchTerm,
			string? typeFournisseur,
			string? ville,
			string? conditionsPaiement,
			int? delaiLivraisonMin,
			int? delaiLivraisonMax,
			decimal? noteQualiteMin,
			decimal? noteQualiteMax,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<Fournisseur?> GetByIdAsync(int id);
		Task<Fournisseur> CreateAsync(Fournisseur entity);
		Task<Fournisseur> UpdateAsync(Fournisseur entity);
		Task<bool> DeleteAsync(int id);
		Task<ContactFournisseur> CreateContactAsync(int fournisseurId, ContactFournisseur contact);
		Task<ContactFournisseur?> UpdateContactAsync(ContactFournisseur contact);
		Task<bool> DeleteContactAsync(int contactId);
		Task<List<string>> GetTypesAsync();
		Task<List<string>> GetVillesAsync();
		Task<List<string>> GetConditionsPaiementAsync();
	}
}



