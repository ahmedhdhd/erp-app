using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
    public class AttendanceDTO
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public EmployeeDTO Employe { get; set; }
        public DateTime Date { get; set; }
        public DateTime? ClockInTime { get; set; }
        public DateTime? ClockOutTime { get; set; }
        public int? HoursWorked { get; set; }
        public int? OvertimeHours { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public DateTime DateCreation { get; set; }
        public DateTime? DateModification { get; set; }
    }

    public class CreateAttendanceRequest
    {
        public int EmployeId { get; set; }
        public DateTime Date { get; set; }
        public DateTime? ClockInTime { get; set; }
        public DateTime? ClockOutTime { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
    }

    public class UpdateAttendanceRequest : CreateAttendanceRequest
    {
        public int Id { get; set; }
    }

    public class AttendanceListResponse
    {
        public List<AttendanceDTO> Attendances { get; set; } = new List<AttendanceDTO>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }

    public class AttendanceSearchRequest
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int? EmployeId { get; set; }
        public string Status { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string SortBy { get; set; } = "Date";
        public string SortDirection { get; set; } = "Desc";
    }
}