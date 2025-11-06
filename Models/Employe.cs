using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Employe
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string CIN { get; set; } // Carte d'Identité Nationale
        public string Poste { get; set; }
        public string Departement { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        public DateTime DateEmbauche { get; set; }
        public string Statut { get; set; } // Actif, Inactif, Suspendu
        
        // ========== HR - Payroll Relationships ==========
        public SituationFamiliale SituationFamiliale { get; set; }
        public List<EtatDePaie> EtatsDePaie { get; set; } = new List<EtatDePaie>();
        public List<Attendance> Attendances { get; set; } = new List<Attendance>();
        
        public List<ActiviteEmploye> Activites { get; set; } = new List<ActiviteEmploye>();
        public List<DemandeAchat> DemandesAchat { get; set; } = new List<DemandeAchat>();
        public Utilisateur? Utilisateur { get; set; }
    }
}