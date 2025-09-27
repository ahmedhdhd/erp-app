using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Livraison
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public CommandeVente Commande { get; set; } // Ajout de la navigation property
        public DateTime DateLivraison { get; set; }
        public string Statut { get; set; } // En préparation, Expédié, Livré, Partiel
        public string Transportateur { get; set; }
        public string NumeroSuivi { get; set; }
        public List<LigneLivraison> Lignes { get; set; } = new List<LigneLivraison>();
    }
}