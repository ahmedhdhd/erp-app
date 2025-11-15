using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Fournisseur
    {
        public int Id { get; set; }
        public string RaisonSociale { get; set; }
        public string TypeFournisseur { get; set; } // Fabricant, Distributeur, Grossiste, Service
        public string ICE { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string CodePostal { get; set; }
        public string Pays { get; set; } = "Tunisie";
        public string Telephone { get; set; }
        public string Email { get; set; }
        public string ConditionsPaiement { get; set; } // Net15, Net30, etc.
        public int DelaiLivraisonMoyen { get; set; } // en jours
        public decimal NoteQualite { get; set; } // 1-5
        public List<ContactFournisseur> Contacts { get; set; } = new List<ContactFournisseur>();
        public List<TransactionFournisseur> HistoriqueAchats { get; set; } = new List<TransactionFournisseur>();
        public PerformanceFournisseur? Performance { get; set; }
        public List<CommandeAchat> CommandesAchat { get; set; } = new List<CommandeAchat>();
        public List<FactureAchat> Factures { get; set; } = new List<FactureAchat>();
        public List<PaiementFournisseur> Paiements { get; set; } = new List<PaiementFournisseur>();
        public List<Reglement> Reglements { get; set; } = new List<Reglement>();
        public List<Journal> Journaux { get; set; } = new List<Journal>();
    }
}
