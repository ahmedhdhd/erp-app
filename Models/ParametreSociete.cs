using System;

namespace App.Models
{
    public class ParametreSociete
    {
        public int Id { get; set; }
        public string NomSociete { get; set; }
        public string ICE { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string Telephone { get; set; }
        public string Email { get; set; }
        public string Logo { get; set; }
        public string Devise { get; set; } = "TND";
        public decimal TauxTVA { get; set; } = 19; // TVA standard en Tunisie
    }
}
