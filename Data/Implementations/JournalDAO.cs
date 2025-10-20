using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Models;
using App.Data.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
    public class JournalDAO : IJournalDAO
    {
        private readonly ApplicationDbContext _db;
        public JournalDAO(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Journal?> GetByIdAsync(int id)
        {
            return await _db.Journaux.FindAsync(id);
        }

        public async Task<List<Journal>> SearchAsync(string? type, int? ownerId, System.DateTime? dateFrom, System.DateTime? dateTo, int page, int pageSize, string sortBy, string sortDirection)
        {
            var query = _db.Journaux.AsQueryable();
            if (!string.IsNullOrWhiteSpace(type)) query = query.Where(j => j.Type == type);
            if (ownerId.HasValue)
            {
                if (type == "Client") query = query.Where(j => j.ClientId == ownerId);
                if (type == "Fournisseur") query = query.Where(j => j.FournisseurId == ownerId);
            }
            if (dateFrom.HasValue) query = query.Where(j => j.Date >= dateFrom.Value);
            if (dateTo.HasValue) query = query.Where(j => j.Date <= dateTo.Value);

            // simple sorting
            query = (sortBy?.ToLower()) switch
            {
                "date" => (sortDirection == "asc") ? query.OrderBy(j => j.Date) : query.OrderByDescending(j => j.Date),
                "montant" => (sortDirection == "asc") ? query.OrderBy(j => j.Montant) : query.OrderByDescending(j => j.Montant),
                _ => query.OrderByDescending(j => j.Date)
            };

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }

        public async Task<int> CountAsync(string? type, int? ownerId, System.DateTime? dateFrom, System.DateTime? dateTo)
        {
            var query = _db.Journaux.AsQueryable();
            if (!string.IsNullOrWhiteSpace(type)) query = query.Where(j => j.Type == type);
            if (ownerId.HasValue)
            {
                if (type == "Client") query = query.Where(j => j.ClientId == ownerId);
                if (type == "Fournisseur") query = query.Where(j => j.FournisseurId == ownerId);
            }
            if (dateFrom.HasValue) query = query.Where(j => j.Date >= dateFrom.Value);
            if (dateTo.HasValue) query = query.Where(j => j.Date <= dateTo.Value);
            return await query.CountAsync();
        }

        public async Task<Journal> CreateAsync(Journal entity)
        {
            _db.Journaux.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<Journal> UpdateAsync(Journal entity)
        {
            _db.Journaux.Update(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Journaux.FindAsync(id);
            if (entity == null) return false;
            _db.Journaux.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}


