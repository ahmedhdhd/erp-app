using System;

namespace App.Models
{
    public class Utilisateur
    {
        public int Id { get; set; }
        public string NomUtilisateur { get; set; }
        public string MotDePasse { get; set; }
        public string Role { get; set; } // Admin, Vendeur, Acheteur, Comptable
        public int EmployeId { get; set; }
        public bool EstActif { get; set; } = true;
        public List<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
        public Employe? Employe { get; set; }
    }
}
