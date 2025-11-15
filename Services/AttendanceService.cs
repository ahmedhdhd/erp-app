using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
    public class AttendanceService
    {
        private readonly IAttendanceDAO _attendanceDAO;
        private readonly IEmployeeDAO _employeeDAO;

        public AttendanceService(IAttendanceDAO attendanceDAO, IEmployeeDAO employeeDAO)
        {
            _attendanceDAO = attendanceDAO;
            _employeeDAO = employeeDAO;
        }

        public async Task<ClientApiResponse<AttendanceListResponse>> GetAllAttendancesAsync(int page, int pageSize)
        {
            var (items, total) = await _attendanceDAO.GetAllAttendancesAsync(page, pageSize);
            var dtos = items.Select(MapToDTO).ToList();

            return new ClientApiResponse<AttendanceListResponse>
            {
                Success = true,
                Data = new AttendanceListResponse
                {
                    Attendances = dtos,
                    TotalCount = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                    HasNextPage = page * pageSize < total,
                    HasPreviousPage = page > 1
                },
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<AttendanceListResponse>> SearchAttendancesAsync(AttendanceSearchRequest request)
        {
            var (items, total) = await _attendanceDAO.SearchAttendancesAsync(
                request.DateFrom,
                request.DateTo,
                request.EmployeId,
                request.Status,
                request.Page,
                request.PageSize,
                request.SortBy,
                request.SortDirection);

            var dtos = items.Select(MapToDTO).ToList();

            return new ClientApiResponse<AttendanceListResponse>
            {
                Success = true,
                Data = new AttendanceListResponse
                {
                    Attendances = dtos,
                    TotalCount = total,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
                    HasNextPage = request.Page * request.PageSize < total,
                    HasPreviousPage = request.Page > 1
                },
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<AttendanceDTO>> GetAttendanceByIdAsync(int id)
        {
            var entity = await _attendanceDAO.GetAttendanceByIdAsync(id);
            if (entity == null)
                return new ClientApiResponse<AttendanceDTO>
                {
                    Success = false,
                    Message = "Attendance record not found"
                };

            return new ClientApiResponse<AttendanceDTO>
            {
                Success = true,
                Data = MapToDTO(entity),
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<AttendanceDTO>> GetAttendanceByEmployeeAndDateAsync(int employeId, DateTime date)
        {
            var entity = await _attendanceDAO.GetAttendanceByEmployeeAndDateAsync(employeId, date);
            if (entity == null)
                return new ClientApiResponse<AttendanceDTO>
                {
                    Success = false,
                    Message = "Attendance record not found"
                };

            return new ClientApiResponse<AttendanceDTO>
            {
                Success = true,
                Data = MapToDTO(entity),
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<AttendanceDTO>> CreateAttendanceAsync(CreateAttendanceRequest request)
        {
            // Validate employee exists
            var employee = await _employeeDAO.GetByIdAsync(request.EmployeId);
            if (employee == null)
                return new ClientApiResponse<AttendanceDTO>
                {
                    Success = false,
                    Message = "Employee not found"
                };

            // Check if attendance already exists for this employee and date
            var existing = await _attendanceDAO.GetAttendanceByEmployeeAndDateAsync(request.EmployeId, request.Date);
            if (existing != null)
                return new ClientApiResponse<AttendanceDTO>
                {
                    Success = false,
                    Message = "Attendance record already exists for this employee and date"
                };

            // Handle DateTime fields properly
            DateTime? clockInTime = null;
            DateTime? clockOutTime = null;
    
            // Safely handle clock in time
            if (request.ClockInTime.HasValue && request.ClockInTime.Value != DateTime.MinValue)
            {
                clockInTime = request.ClockInTime.Value;
            }
    
            // Safely handle clock out time
            if (request.ClockOutTime.HasValue && request.ClockOutTime.Value != DateTime.MinValue)
            {
                clockOutTime = request.ClockOutTime.Value;
            }

            // Calculate hours worked if both clock in and out times are provided
            int? hoursWorked = null;
            int? overtimeHours = null;
    
            if (clockInTime.HasValue && clockOutTime.HasValue)
            {
                var workDuration = clockOutTime.Value - clockInTime.Value;
                hoursWorked = (int)workDuration.TotalHours;
        
                // Assuming 8 hours is standard work day, anything above is overtime
                if (hoursWorked > 8)
                {
                    overtimeHours = hoursWorked - 8;
                    hoursWorked = 8;
                }
            }

            var entity = new Attendance
            {
                EmployeId = request.EmployeId,
                Date = request.Date.Date, // Ensure we only store the date part
                ClockInTime = clockInTime,
                ClockOutTime = clockOutTime,
                HoursWorked = hoursWorked,
                OvertimeHours = overtimeHours,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Present" : request.Status.Trim(),
                // Ensure non-null Notes to satisfy DB non-null constraint
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? string.Empty : request.Notes.Trim(),
                DateCreation = DateTime.Now
            };

            var created = await _attendanceDAO.CreateAttendanceAsync(entity);
            return new ClientApiResponse<AttendanceDTO>
            {
                Success = true,
                Data = MapToDTO(created),
                Message = "Attendance record created successfully"
            };
        }

        public async Task<ClientApiResponse<AttendanceDTO>> UpdateAttendanceAsync(int id, UpdateAttendanceRequest request)
        {
            var existing = await _attendanceDAO.GetAttendanceByIdAsync(id);
            if (existing == null)
                return new ClientApiResponse<AttendanceDTO>
                {
                    Success = false,
                    Message = "Attendance record not found"
                };

            // Validate employee exists
            if (request.EmployeId != existing.EmployeId)
            {
                var employee = await _employeeDAO.GetByIdAsync(request.EmployeId);
                if (employee == null)
                    return new ClientApiResponse<AttendanceDTO>
                    {
                        Success = false,
                        Message = "Employee not found"
                    };
            }

            // Handle DateTime fields properly
            DateTime? clockInTime = existing.ClockInTime;
            DateTime? clockOutTime = existing.ClockOutTime;
    
            // Update clock in time if provided
            if (request.ClockInTime.HasValue)
            {
                if (request.ClockInTime.Value == DateTime.MinValue)
                {
                    clockInTime = null; // Treat MinValue as null
                }
                else
                {
                    clockInTime = request.ClockInTime.Value;
                }
            }
    
            // Update clock out time if provided
            if (request.ClockOutTime.HasValue)
            {
                if (request.ClockOutTime.Value == DateTime.MinValue)
                {
                    clockOutTime = null; // Treat MinValue as null
                }
                else
                {
                    clockOutTime = request.ClockOutTime.Value;
                }
            }

            // Calculate hours worked if both clock in and out times are provided
            int? hoursWorked = existing.HoursWorked;
            int? overtimeHours = existing.OvertimeHours;
    
            if (clockInTime.HasValue && clockOutTime.HasValue)
            {
                var workDuration = clockOutTime.Value - clockInTime.Value;
                hoursWorked = (int)workDuration.TotalHours;
        
                // Assuming 8 hours is standard work day, anything above is overtime
                if (hoursWorked > 8)
                {
                    overtimeHours = hoursWorked - 8;
                    hoursWorked = 8;
                }
            }

            // Update values
            existing.EmployeId = request.EmployeId;
            existing.Date = request.Date.Date; // Ensure we only store the date part
            existing.ClockInTime = clockInTime;
            existing.ClockOutTime = clockOutTime;
            existing.HoursWorked = hoursWorked;
            existing.OvertimeHours = overtimeHours;
            existing.Status = string.IsNullOrWhiteSpace(request.Status) ? existing.Status : request.Status.Trim();
            // Keep Notes non-null to satisfy DB constraint
            if (string.IsNullOrWhiteSpace(request.Notes))
            {
                existing.Notes = existing.Notes ?? string.Empty;
            }
            else
            {
                existing.Notes = request.Notes.Trim();
            }

            var updated = await _attendanceDAO.UpdateAttendanceAsync(existing);
            return new ClientApiResponse<AttendanceDTO>
            {
                Success = true,
                Data = MapToDTO(updated),
                Message = "Attendance record updated successfully"
            };
        }

        public async Task<ClientApiResponse<bool>> DeleteAttendanceAsync(int id)
        {
            var result = await _attendanceDAO.DeleteAttendanceAsync(id);
            if (!result)
                return new ClientApiResponse<bool>
                {
                    Success = false,
                    Data = false,
                    Message = "Attendance record not found"
                };

            return new ClientApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Attendance record deleted successfully"
            };
        }

        // Mapping methods
        private static AttendanceDTO MapToDTO(Attendance attendance)
        {
            return new AttendanceDTO
            {
                Id = attendance.Id,
                EmployeId = attendance.EmployeId,
                Employe = attendance.Employe != null ? new EmployeeDTO
                {
                    Id = attendance.Employe.Id,
                    Nom = attendance.Employe.Nom,
                    Prenom = attendance.Employe.Prenom,
                    CIN = attendance.Employe.CIN,
                    Poste = attendance.Employe.Poste,
                    Departement = attendance.Employe.Departement,
                    Email = attendance.Employe.Email,
                    Telephone = attendance.Employe.Telephone,
                    DateEmbauche = attendance.Employe.DateEmbauche,
                    Statut = attendance.Employe.Statut
                } : null,
                Date = attendance.Date,
                ClockInTime = attendance.ClockInTime,
                ClockOutTime = attendance.ClockOutTime,
                HoursWorked = attendance.HoursWorked,
                OvertimeHours = attendance.OvertimeHours,
                Status = attendance.Status,
                Notes = attendance.Notes,
                DateCreation = attendance.DateCreation,
                DateModification = attendance.DateModification
            };
        }
    }
}