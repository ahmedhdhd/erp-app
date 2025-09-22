using System;

namespace App.Models
{
    public class ContactClient
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Poste { get; set; }
        public string Telephone { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } // Commercial, Financier, Technique
    }
}
