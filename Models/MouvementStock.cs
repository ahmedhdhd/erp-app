using System;

namespace App.Models
{
    public class MouvementStock
    {
        public int Id { get; set; }
        public int ProduitId { get; set; }
        public DateTime DateMouvement { get; set; }
        public string Type { get; set; } // Entrée, Sortie, Ajustement, Transfert
        public int Quantite { get; set; }
        public string ReferenceDocument { get; set; } // Bon de commande, facture, etc.
        public string Emplacement { get; set; } // Entrepôt, Rayon, etc.
    }
}
