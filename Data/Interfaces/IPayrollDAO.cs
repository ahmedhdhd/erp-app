using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
    public interface IPayrollDAO
    {
        // SituationFamiliale methods
        Task<SituationFamiliale> GetSituationFamilialeByEmployeIdAsync(int employeId);
        Task<SituationFamiliale> CreateSituationFamilialeAsync(SituationFamiliale entity);
        Task<SituationFamiliale> UpdateSituationFamilialeAsync(SituationFamiliale entity);
        Task<bool> DeleteSituationFamilialeAsync(int id);
        
        // EtatDePaie methods
        Task<(IEnumerable<EtatDePaie> Items, int TotalCount)> GetAllEtatsDePaieAsync(int page, int pageSize);
        Task<(IEnumerable<EtatDePaie> Items, int TotalCount)> SearchEtatsDePaieAsync(string mois, int? employeId, int page, int pageSize, string sortBy, string sortDirection);
        Task<EtatDePaie> GetEtatDePaieByIdAsync(int id);
        Task<IEnumerable<EtatDePaie>> GetEtatsDePaieByEmployeIdAsync(int employeId);
        Task<EtatDePaie> CreateEtatDePaieAsync(EtatDePaie entity);
        Task<EtatDePaie> UpdateEtatDePaieAsync(EtatDePaie entity);
        Task<bool> DeleteEtatDePaieAsync(int id);
    }
}