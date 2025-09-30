using System.Threading.Tasks;
using App.Models;

namespace App.Data
{
    public interface ICompanySettingsDAO
    {
        Task<CompanySettings?> GetAsync();
        Task<CompanySettings> CreateAsync(CompanySettings settings);
        Task<CompanySettings?> UpdateAsync(CompanySettings settings);
    }
}