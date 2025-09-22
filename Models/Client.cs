using System;
using System.Collections.Generic;

namespace App.Models
{
    public class Client
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string RaisonSociale { get; set; }
        public string TypeClient { get; set; } // Individuel, Entreprise, Grossiste, Détailant
        public string ICE { get; set; } // Identifiant Commun de l'Entreprise (Tunisie)
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string CodePostal { get; set; }
        public string Pays { get; set; } = "Tunisie";
        public string Telephone { get; set; }
        public string Email { get; set; }
        public string Classification { get; set; } // VIP, Standard, Nouveau
        public decimal LimiteCredit { get; set; }
        public decimal SoldeActuel { get; set; }
        public bool EstActif { get; set; } = true;
        public DateTime DateCreation { get; set; } = DateTime.Now;
        public List<ContactClient> Contacts { get; set; } = new List<ContactClient>();
        public List<TransactionClient> HistoriqueAchats { get; set; } = new List<TransactionClient>();
        public AnalyseClient? Analyse { get; set; }
        public List<Devis> Devis { get; set; } = new List<Devis>();
        public List<CommandeVente> CommandesVente { get; set; } = new List<CommandeVente>();
        public List<FactureVente> Factures { get; set; } = new List<FactureVente>();
        public List<RetourVente> Retours { get; set; } = new List<RetourVente>();
        public List<PaiementClient> Paiements { get; set; } = new List<PaiementClient>();
    }
}
