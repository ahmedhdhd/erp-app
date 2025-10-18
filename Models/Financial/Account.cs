using System.ComponentModel.DataAnnotations;

namespace App.Models.Financial
{
    public class Account : BaseEntity
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public AccountType Type { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public int? ParentAccountId { get; set; }
        public Account? ParentAccount { get; set; }
        public List<Account> ChildAccounts { get; set; } = new List<Account>();

        public List<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
    }

    public enum AccountType
    {
        Asset = 1,           // Actif
        Liability = 2,       // Passif
        Equity = 3,          // Capitaux propres
        Revenue = 4,         // Produits
        Expense = 5,         // Charges
        Bank = 6,           // Banque
        Cash = 7,           // Caisse
        Client = 8,         // Client
        Supplier = 9,       // Fournisseur
        VAT = 10,           // TVA
        Tax = 11            // Impôts
    }
}
