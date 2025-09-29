using System;

namespace App.Models
{
    public class LigneFactureAchat
    {
        public int Id { get; set; }
        public int FactureId { get; set; }
        public FactureAchat Facture { get; set; } // Ajout de la navigation property
        public int LigneCommandeId { get; set; }
        public LigneCommandeAchat LigneCommande { get; set; } // Ajout de la navigation property
        public int QuantiteFacturee { get; set; }
        public decimal PrixUnitaireHT { get; set; }
        public decimal TauxTVA { get; set; }
        public decimal PrixUnitaireTTC { get; set; }
        public decimal TotalLigne { get; set; }
    }
}