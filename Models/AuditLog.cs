using System;

namespace App.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public DateTime DateAction { get; set; } = DateTime.Now;
        public string Action { get; set; } // Création, Modification, Suppression
        public string TableAffectee { get; set; }
        public string AncienneValeur { get; set; }
        public string NouvelleValeur { get; set; }
        public string IPAddress { get; set; }
    }
}