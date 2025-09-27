using System;

namespace App.Models
{
    public class LigneDemandeAchat
    {
        public int Id { get; set; }
        public int DemandeId { get; set; }
        public DemandeAchat Demande { get; set; } // Ajout de la navigation property
        public int ProduitId { get; set; }
        public Produit Produit { get; set; } // Ajout de la navigation property
        public int Quantite { get; set; }
        public string Justification { get; set; }
    }
}