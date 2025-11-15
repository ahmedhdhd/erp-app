using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
    public class PayrollDAO : IPayrollDAO
    {
        private readonly ApplicationDbContext _db;

        public PayrollDAO(ApplicationDbContext db)
        {
            _db = db;
        }

        // SituationFamiliale methods
        public async Task<SituationFamiliale> GetSituationFamilialeByEmployeIdAsync(int employeId)
        {
            return await _db.SituationsFamiliales
                .FirstOrDefaultAsync(sf => sf.EmployeId == employeId);
        }
        
        public async Task<SituationFamiliale> GetSituationFamilialeByIdAsync(int id)
        {
            return await _db.SituationsFamiliales
                .FirstOrDefaultAsync(sf => sf.Id == id);
        }

        public async Task<SituationFamiliale> CreateSituationFamilialeAsync(SituationFamiliale entity)
        {
            entity.DateDerniereMaj = DateTime.Now;
            _db.SituationsFamiliales.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<SituationFamiliale> UpdateSituationFamilialeAsync(SituationFamiliale entity)
        {
            entity.DateDerniereMaj = DateTime.Now;
            _db.SituationsFamiliales.Update(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteSituationFamilialeAsync(int id)
        {
            var entity = await _db.SituationsFamiliales.FindAsync(id);
            if (entity == null) return false;
            _db.SituationsFamiliales.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
        
        public async Task<IEnumerable<Employe>> GetAllEmployeesWithSituationFamilialeAsync()
        {
            return await _db.Employes
                .Include(e => e.SituationFamiliale)
                .Where(e => e.SituationFamiliale != null)
                .ToListAsync();
        }

        // EtatDePaie methods
        public async Task<(IEnumerable<EtatDePaie> Items, int TotalCount)> GetAllEtatsDePaieAsync(int page, int pageSize)
        {
            var query = _db.EtatsDePaie
                .Include(ep => ep.Employe)
                .AsQueryable();
                
            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(ep => ep.DateCreation)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            return (items, total);
        }

        public async Task<(IEnumerable<EtatDePaie> Items, int TotalCount)> SearchEtatsDePaieAsync(string mois, int? employeId, int page, int pageSize, string sortBy, string sortDirection)
        {
            var query = _db.EtatsDePaie
                .Include(ep => ep.Employe)
                .AsQueryable();

            if (!string.IsNullOrEmpty(mois)) 
                query = query.Where(ep => ep.Mois == mois);
            if (employeId.HasValue) 
                query = query.Where(ep => ep.EmployeId == employeId.Value);

            bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
            switch (sortBy?.ToLower())
            {
                case "datecreation": 
                    query = desc ? query.OrderByDescending(ep => ep.DateCreation) : query.OrderBy(ep => ep.DateCreation); 
                    break;
                case "mois": 
                    query = desc ? query.OrderByDescending(ep => ep.Mois) : query.OrderBy(ep => ep.Mois); 
                    break;
                case "employeid": 
                    query = desc ? query.OrderByDescending(ep => ep.EmployeId) : query.OrderBy(ep => ep.EmployeId); 
                    break;
                default: 
                    query = query.OrderByDescending(ep => ep.DateCreation); 
                    break;
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<EtatDePaie> GetEtatDePaieByIdAsync(int id)
        {
            return await _db.EtatsDePaie
                .Include(ep => ep.Employe)
                .FirstOrDefaultAsync(ep => ep.Id == id);
        }

        public async Task<EtatDePaie> GetEtatDePaieByEmployeeAndMonthAsync(int employeId, string mois)
        {
            return await _db.EtatsDePaie
                .Include(ep => ep.Employe)
                .FirstOrDefaultAsync(ep => ep.EmployeId == employeId && ep.Mois == mois);
        }

        public async Task<IEnumerable<EtatDePaie>> GetEtatsDePaieByEmployeIdAsync(int employeId)
        {
            return await _db.EtatsDePaie
                .Where(ep => ep.EmployeId == employeId)
                .ToListAsync();
        }

        public async Task<EtatDePaie> CreateEtatDePaieAsync(EtatDePaie entity)
        {
            entity.DateCreation = DateTime.Now;
            _db.EtatsDePaie.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<EtatDePaie> UpdateEtatDePaieAsync(EtatDePaie entity)
        {
            _db.EtatsDePaie.Update(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteEtatDePaieAsync(int id)
        {
            var entity = await _db.EtatsDePaie.FindAsync(id);
            if (entity == null) return false;
            _db.EtatsDePaie.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}