using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Models;
using App.Data.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
    public class ReglementDAO : IReglementDAO
    {
        private readonly ApplicationDbContext _db;
        public ReglementDAO(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Reglement?> GetByIdAsync(int id)
        {
            return await _db.Reglements.FindAsync(id);
        }

        public async Task<List<Reglement>> GetByCommandeVenteAsync(int commandeVenteId)
        {
            return await _db.Reglements.Where(r => r.CommandeVenteId == commandeVenteId).ToListAsync();
        }

        public async Task<List<Reglement>> GetByCommandeAchatAsync(int commandeAchatId)
        {
            return await _db.Reglements.Where(r => r.CommandeAchatId == commandeAchatId).ToListAsync();
        }

        public async Task<List<Reglement>> GetByClientAsync(int clientId)
        {
            return await _db.Reglements.Where(r => r.ClientId == clientId).ToListAsync();
        }

        public async Task<List<Reglement>> GetByFournisseurAsync(int fournisseurId)
        {
            return await _db.Reglements.Where(r => r.FournisseurId == fournisseurId).ToListAsync();
        }

        public async Task<Reglement> CreateAsync(Reglement entity)
        {
            _db.Reglements.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<Reglement> UpdateAsync(Reglement entity)
        {
            _db.Reglements.Update(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Reglements.FindAsync(id);
            if (entity == null) return false;
            _db.Reglements.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}


