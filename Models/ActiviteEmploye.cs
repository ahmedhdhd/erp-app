using System;

namespace App.Models
{
    public class ActiviteEmploye
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public DateTime DateActivite { get; set; }
        public string Type { get; set; } // Vente, Achat, Service Client
        public string Description { get; set; }
        public decimal Montant { get; set; } // si applicable
    }
}
