using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        
        [Required]
        public int EmployeId { get; set; }
        public Employe Employe { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public DateTime? ClockInTime { get; set; }
        
        public DateTime? ClockOutTime { get; set; }
        
        public int? HoursWorked { get; set; } // Calculated field
        
        public int? OvertimeHours { get; set; } // Calculated field
        
        public string Status { get; set; } // Present, Absent, Late, HalfDay, etc.
        
        public string Notes { get; set; }
        
        public DateTime DateCreation { get; set; }
        
        public DateTime? DateModification { get; set; }
    }
}