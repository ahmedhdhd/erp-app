using System.ComponentModel.DataAnnotations;

namespace App.Models.DTOs
{
    // Account DTOs
    public class AccountDTO
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int Level { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public decimal? Balance { get; set; }
    }

    public class CreateAccountDTO
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; }

        public int? ParentId { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }

    public class UpdateAccountDTO
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; }

        public int? ParentId { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }

    // Journal Entry DTOs
    public class JournalEntryDTO
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Reference { get; set; }
        public string? Description { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime? PostedDate { get; set; }
        public string? PostedByUserName { get; set; }
        public List<JournalEntryLineDTO> Lines { get; set; } = new List<JournalEntryLineDTO>();
    }

    public class CreateJournalEntryDTO
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(50)]
        public string Reference { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [MinLength(2, ErrorMessage = "At least 2 lines are required")]
        public List<CreateJournalEntryLineDTO> Lines { get; set; } = new List<CreateJournalEntryLineDTO>();
    }

    public class UpdateJournalEntryDTO
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(50)]
        public string Reference { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [MinLength(2, ErrorMessage = "At least 2 lines are required")]
        public List<CreateJournalEntryLineDTO> Lines { get; set; } = new List<CreateJournalEntryLineDTO>();
    }

    // Journal Entry Line DTOs
    public class JournalEntryLineDTO
    {
        public int Id { get; set; }
        public int JournalEntryId { get; set; }
        public int AccountId { get; set; }
        public string AccountCode { get; set; }
        public string AccountName { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string? Description { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
    }

    public class CreateJournalEntryLineDTO
    {
        [Required]
        public int AccountId { get; set; }

        public decimal DebitAmount { get; set; } = 0;
        public decimal CreditAmount { get; set; } = 0;

        [StringLength(500)]
        public string? Description { get; set; }

        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
    }

    // Bank Account DTOs
    public class BankAccountDTO
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; }
        public string BankName { get; set; }
        public string AccountName { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
    }

    public class CreateBankAccountDTO
    {
        [Required]
        [StringLength(50)]
        public string AccountNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string BankName { get; set; }

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; }

        [StringLength(10)]
        public string Currency { get; set; } = "TND";

        [StringLength(200)]
        public string? Description { get; set; }
    }

    public class UpdateBankAccountDTO
    {
        [Required]
        [StringLength(50)]
        public string AccountNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string BankName { get; set; }

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; }

        [StringLength(10)]
        public string Currency { get; set; }

        [StringLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }

    // Financial Report DTOs
    public class TrialBalanceDTO
    {
        public string AccountCode { get; set; }
        public string AccountName { get; set; }
        public decimal DebitBalance { get; set; }
        public decimal CreditBalance { get; set; }
    }

    public class ProfitLossDTO
    {
        public string AccountCode { get; set; }
        public string AccountName { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } // Revenue or Expense
    }

    public class BalanceSheetDTO
    {
        public string AccountCode { get; set; }
        public string AccountName { get; set; }
        public decimal Balance { get; set; }
        public string Type { get; set; } // Asset, Liability, Equity
    }
}
