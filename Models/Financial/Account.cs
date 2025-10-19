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

        public decimal Balance { get; set; } = 0; // Current balance of the account

        public List<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
    }

    public enum AccountType
    {
        Asset = 1,          // Actif (e.g., Bank, Cash, Accounts Receivable)
        Liability = 2,      // Passif (e.g., Accounts Payable, Loans)
        Equity = 3,         // Capitaux propres
        Revenue = 4,        // Produits (e.g., Sales Revenue)
        Expense = 5,        // Charges (e.g., Cost of Goods Sold, Salaries)
        VAT = 6,            // TVA (Collected, Deductible)
        Bank = 7,           // Compte bancaire
        Cash = 8,           // Caisse
        Receivable = 9,     // Comptes clients
        Payable = 10        // Comptes fournisseurs
    }
}
