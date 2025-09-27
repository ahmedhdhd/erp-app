using System;
using System.Collections.Generic;

namespace App.Models
{
    public class RetourVente
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public FactureVente Facture { get; set; } // Ajout de la navigation property
        public int ClientId { get; set; }
        public Client Client { get; set; } // Ajout de la navigation property
        public DateTime DateRetour { get; set; }
        public string Motif { get; set; }
        public string Statut { get; set; } // En attente, Traité, Remboursé, Échange
        public List<LigneRetourVente> Lignes { get; set; } = new List<LigneRetourVente>();
    }
}