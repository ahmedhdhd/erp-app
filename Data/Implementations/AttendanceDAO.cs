using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using Microsoft.EntityFrameworkCore;

namespace App.Data.Implementations
{
    public class AttendanceDAO : IAttendanceDAO
    {
        private readonly ApplicationDbContext _db;

        public AttendanceDAO(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Attendance> GetAttendanceByIdAsync(int id)
        {
            return await _db.Attendances
                .Include(a => a.Employe)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Attendance> GetAttendanceByEmployeeAndDateAsync(int employeId, DateTime date)
        {
            return await _db.Attendances
                .Include(a => a.Employe)
                .FirstOrDefaultAsync(a => a.EmployeId == employeId && a.Date.Date == date.Date);
        }

        public async Task<IEnumerable<Attendance>> GetAttendancesByEmployeeAsync(int employeId)
        {
            return await _db.Attendances
                .Where(a => a.EmployeId == employeId)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Attendance> Items, int TotalCount)> GetAllAttendancesAsync(int page, int pageSize)
        {
            var query = _db.Attendances
                .Include(a => a.Employe)
                .AsQueryable();

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<(IEnumerable<Attendance> Items, int TotalCount)> SearchAttendancesAsync(
            DateTime? dateFrom,
            DateTime? dateTo,
            int? employeId,
            string status,
            int page,
            int pageSize,
            string sortBy,
            string sortDirection)
        {
            var query = _db.Attendances
                .Include(a => a.Employe)
                .AsQueryable();

            if (dateFrom.HasValue)
                query = query.Where(a => a.Date >= dateFrom.Value);
            if (dateTo.HasValue)
                query = query.Where(a => a.Date <= dateTo.Value);
            if (employeId.HasValue)
                query = query.Where(a => a.EmployeId == employeId.Value);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status);

            bool desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
            switch (sortBy?.ToLower())
            {
                case "date":
                    query = desc ? query.OrderByDescending(a => a.Date) : query.OrderBy(a => a.Date);
                    break;
                case "employeid":
                    query = desc ? query.OrderByDescending(a => a.EmployeId) : query.OrderBy(a => a.EmployeId);
                    break;
                case "status":
                    query = desc ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status);
                    break;
                default:
                    query = query.OrderByDescending(a => a.Date);
                    break;
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<Attendance> CreateAttendanceAsync(Attendance entity)
        {
            entity.DateCreation = DateTime.Now;
            _db.Attendances.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<Attendance> UpdateAttendanceAsync(Attendance entity)
        {
            entity.DateModification = DateTime.Now;
            _db.Attendances.Update(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAttendanceAsync(int id)
        {
            var entity = await _db.Attendances.FindAsync(id);
            if (entity == null) return false;
            _db.Attendances.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Attendance>> GetAttendancesByDateAsync(DateTime date)
        {
            return await _db.Attendances
                .Where(a => a.Date.Date == date.Date)
                .ToListAsync();
        }
    }
}