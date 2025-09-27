using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Devis
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public Client Client { get; set; } // Ajout de la navigation property
        public DateTime DateCreation { get; set; } = DateTime.Now;
        public DateTime DateExpiration { get; set; }
        public string Statut { get; set; } // Brouillon, Envoyé, Accepté, Rejeté
        public decimal MontantHT { get; set; }
        public decimal MontantTTC { get; set; }
        public decimal Remise { get; set; }
        public List<LigneDevis> Lignes { get; set; } = new List<LigneDevis>();
    }
}