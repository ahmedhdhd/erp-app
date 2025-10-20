using System.ComponentModel.DataAnnotations;

namespace App.Models
{
    public class JournalEntry : BaseEntity
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(50)]
        public string Reference { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Draft"; // Draft, Posted, Reversed

        public int? CreatedByUserId { get; set; }
        public Utilisateur? CreatedByUser { get; set; }

        public DateTime? PostedDate { get; set; }
        public int? PostedByUserId { get; set; }
        public Utilisateur? PostedByUser { get; set; }

        // Navigation properties
        public List<JournalEntryLine> Lines { get; set; } = new List<JournalEntryLine>();
    }
}
