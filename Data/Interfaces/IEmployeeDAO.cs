using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
	public interface IEmployeeDAO
	{
		Task<(IEnumerable<Employe> Items, int TotalCount)> GetAllAsync(int page, int pageSize, string? searchTerm);
		Task<(IEnumerable<Employe> Items, int TotalCount)> SearchAsync(
			string? searchTerm,
			string? departement,
			string? poste,
			string? statut,
			System.DateTime? dateFrom,
			System.DateTime? dateTo,
			int page,
			int pageSize,
			string sortBy,
			string sortDirection);
		Task<Employe?> GetByIdAsync(int id);
		Task<Employe> CreateAsync(Employe entity);
		Task<Employe> UpdateAsync(Employe entity);
		Task<bool> DeleteAsync(int id);
		Task<bool> UpdateStatusAsync(int id, string newStatus);
		Task<List<string>> GetDepartmentsAsync();
		Task<List<string>> GetPositionsAsync();
		Task<List<string>> GetStatusesAsync();
		Task<bool> IsCinAvailableAsync(string cin);
	}
}