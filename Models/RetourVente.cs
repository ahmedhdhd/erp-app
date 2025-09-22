using System;
using System.Collections.Generic;

namespace App.Models
{
    public class RetourVente
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public int ClientId { get; set; }
        public DateTime DateRetour { get; set; }
        public string Motif { get; set; }
        public string Statut { get; set; } // En attente, Traité, Remboursé, Échange
        public List<LigneRetourVente> Lignes { get; set; } = new List<LigneRetourVente>();
    }
}
