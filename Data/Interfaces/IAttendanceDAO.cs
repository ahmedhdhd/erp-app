using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models;

namespace App.Data.Interfaces
{
    public interface IAttendanceDAO
    {
        Task<Attendance> GetAttendanceByIdAsync(int id);
        Task<Attendance> GetAttendanceByEmployeeAndDateAsync(int employeId, DateTime date);
        Task<IEnumerable<Attendance>> GetAttendancesByEmployeeAsync(int employeId);
        Task<(IEnumerable<Attendance> Items, int TotalCount)> GetAllAttendancesAsync(int page, int pageSize);
        Task<(IEnumerable<Attendance> Items, int TotalCount)> SearchAttendancesAsync(
            DateTime? dateFrom, 
            DateTime? dateTo, 
            int? employeId, 
            string status, 
            int page, 
            int pageSize, 
            string sortBy, 
            string sortDirection);
        Task<Attendance> CreateAttendanceAsync(Attendance entity);
        Task<Attendance> UpdateAttendanceAsync(Attendance entity);
        Task<bool> DeleteAttendanceAsync(int id);
        Task<IEnumerable<Attendance>> GetAttendancesByDateAsync(DateTime date);
    }
}