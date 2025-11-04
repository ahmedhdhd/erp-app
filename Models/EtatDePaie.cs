using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class EtatDePaie
    {
        public int Id { get; set; }
        
        [Required]
        public int EmployeId { get; set; }
        public Employe Employe { get; set; }
        
        public string Mois { get; set; } // Format: "YYYY-MM"
        
        public int NombreDeJours { get; set; }
        
        public decimal SalaireBase { get; set; }
        
        public decimal PrimePresence { get; set; } // PT
        
        public decimal PrimeProduction { get; set; } // PP
        
        public decimal SalaireBrut { get; set; }
        
        public decimal CNSS { get; set; }
        
        public decimal SalaireImposable { get; set; }
        
        public decimal IRPP { get; set; }
        
        public decimal CSS { get; set; }
        
        public decimal SalaireNet { get; set; }
        
        public DateTime DateCreation { get; set; }
    }
}