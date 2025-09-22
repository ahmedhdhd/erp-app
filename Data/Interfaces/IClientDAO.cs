using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
	public interface IClientDAO
	{
		Task<(IEnumerable<Client> Items, int TotalCount)> GetAllAsync(int page, int pageSize);
		Task<(IEnumerable<Client> Items, int TotalCount)> SearchAsync(
			string? searchTerm,
			string? typeClient,
			string? classification,
			string? ville,
			bool? estActif,
			decimal? creditMin,
			decimal? creditMax,
			System.DateTime? dateFrom,
			System.DateTime? dateTo,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<Client?> GetByIdAsync(int id);
		Task<Client> CreateAsync(Client entity);
		Task<Client> UpdateAsync(Client entity);
		Task<bool> DeleteAsync(int id);
		Task<ContactClient> CreateContactAsync(int clientId, ContactClient contact);
		Task<ContactClient?> UpdateContactAsync(ContactClient contact);
		Task<bool> DeleteContactAsync(int contactId);
		Task<List<string>> GetClientTypesAsync();
		Task<List<string>> GetClassificationsAsync();
		Task<List<string>> GetCitiesAsync();
	}
}


