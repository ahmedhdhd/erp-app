using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
    public interface IJournalDAO
    {
        Task<Journal?> GetByIdAsync(int id);
        Task<List<Journal>> SearchAsync(string? type, int? ownerId, System.DateTime? dateFrom, System.DateTime? dateTo, int page, int pageSize, string sortBy, string sortDirection);
        Task<int> CountAsync(string? type, int? ownerId, System.DateTime? dateFrom, System.DateTime? dateTo);
        Task<Journal> CreateAsync(Journal entity);
        Task<Journal> UpdateAsync(Journal entity);
        Task<bool> DeleteAsync(int id);
    }
}


