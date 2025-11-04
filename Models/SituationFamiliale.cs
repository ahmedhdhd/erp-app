using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Models
{
    public class SituationFamiliale
    {
        public int Id { get; set; }
        
        [Required]
        public int EmployeId { get; set; }
        public Employe Employe { get; set; }
        
        public string EtatCivil { get; set; } // Célibataire, Marié, Divorcé, Veuf
        
        public bool ChefDeFamille { get; set; }
        
        public int NombreEnfants { get; set; }
        
        public int EnfantsEtudiants { get; set; }
        
        public int EnfantsHandicapes { get; set; }
        
        public int ParentsACharge { get; set; }
        
        public bool ConjointACharge { get; set; }
        
        public DateTime DateDerniereMaj { get; set; }
    }
}