using System;

namespace App.Models
{
    public class SequenceNumerique
    {
        public int Id { get; set; }
        public string TypeDocument { get; set; } // Facture, Commande, Devis, etc.
        public string Prefixe { get; set; }
        public int ProchainNumero { get; set; }
        public int Longueur { get; set; }
    }
}
