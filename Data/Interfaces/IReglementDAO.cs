using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
    public interface IReglementDAO
    {
        Task<Reglement?> GetByIdAsync(int id);
        Task<List<Reglement>> GetByCommandeVenteAsync(int commandeVenteId);
        Task<List<Reglement>> GetByCommandeAchatAsync(int commandeAchatId);
        Task<List<Reglement>> GetByClientAsync(int clientId);
        Task<List<Reglement>> GetByFournisseurAsync(int fournisseurId);
        Task<Reglement> CreateAsync(Reglement entity);
        Task<Reglement> UpdateAsync(Reglement entity);
        Task<bool> DeleteAsync(int id);
    }
}


