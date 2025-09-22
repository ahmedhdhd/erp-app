using System;
using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public abstract class BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreation { get; set; } = DateTime.UtcNow;
        public DateTime? DateModification { get; set; }
        public string CreePar { get; set; } = string.Empty;
        public string ModifiePar { get; set; } = string.Empty;
    }
}
