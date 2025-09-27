using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Reception
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public CommandeAchat Commande { get; set; } // Ajout de la navigation property
        public DateTime DateReception { get; set; }
        public string Statut { get; set; } // Partielle, Complète
        public List<LigneReception> Lignes { get; set; } = new List<LigneReception>();
    }
}