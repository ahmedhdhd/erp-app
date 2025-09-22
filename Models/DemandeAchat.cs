using System;
using System.Collections.Generic;

namespace App.Models
{
    public class DemandeAchat
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public DateTime DateDemande { get; set; } = DateTime.Now;
        public string Statut { get; set; } // Brouillon, Approuvée, Rejetée, Commandée
        public List<LigneDemandeAchat> Lignes { get; set; } = new List<LigneDemandeAchat>();
    }
}
