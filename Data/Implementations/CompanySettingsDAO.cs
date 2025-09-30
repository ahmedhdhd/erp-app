using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using App.Models;
using App.Data;

namespace App.Data.Implementations
{
    public class CompanySettingsDAO : ICompanySettingsDAO
    {
        private readonly ApplicationDbContext _db;

        public CompanySettingsDAO(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<CompanySettings?> GetAsync()
        {
            return await _db.CompanySettings.FirstOrDefaultAsync();
        }

        public async Task<CompanySettings> CreateAsync(CompanySettings settings)
        {
            settings.DateCreation = System.DateTime.UtcNow;
            settings.DateModification = System.DateTime.UtcNow;
            _db.CompanySettings.Add(settings);
            await _db.SaveChangesAsync();
            return settings;
        }

        public async Task<CompanySettings?> UpdateAsync(CompanySettings settings)
        {
            var existing = await _db.CompanySettings.FindAsync(settings.Id);
            if (existing == null) return null;
            
            existing.NomSociete = settings.NomSociete;
            existing.Adresse = settings.Adresse;
            existing.Telephone = settings.Telephone;
            existing.Email = settings.Email;
            existing.ICE = settings.ICE;
            existing.Devise = settings.Devise;
            existing.TauxTVA = settings.TauxTVA;
            existing.Logo = settings.Logo;
            existing.DateModification = System.DateTime.UtcNow;
            
            _db.CompanySettings.Update(existing);
            await _db.SaveChangesAsync();
            return existing;
        }
    }
}