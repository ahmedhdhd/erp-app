using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Produit
    {
        public int Id { get; set; }
        public string Reference { get; set; } // SKU
        public string Designation { get; set; }
        public string Description { get; set; }
        public string Categorie { get; set; }
        public string SousCategorie { get; set; }
        public decimal PrixAchat { get; set; }
        public decimal PrixVente { get; set; }
        public decimal PrixVenteMin { get; set; }
        public string Unite { get; set; } // Pièce, Kg, Litre, etc.
        public string Statut { get; set; } // Actif, Inactif, Discontinué, Rupture
        public int StockActuel { get; set; }
        public int StockMinimum { get; set; }
        public int StockMaximum { get; set; }
        public List<VariantProduit> Variantes { get; set; } = new List<VariantProduit>();
        public List<MouvementStock> Mouvements { get; set; } = new List<MouvementStock>();
        public List<Inventaire> Inventaires { get; set; } = new List<Inventaire>();
    }
}
