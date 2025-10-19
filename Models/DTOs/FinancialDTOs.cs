using App.Models.Financial;

namespace App.Models.DTOs
{
    #region Account DTOs
    public class AccountDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int? ParentAccountId { get; set; }
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateAccountDTO
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? ParentAccountId { get; set; }
    }

    public class UpdateAccountDTO
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int? ParentAccountId { get; set; }
    }
    #endregion

    #region Journal DTOs
    public class JournalDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public JournalType Type { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public string? DefaultDebitAccountCode { get; set; }
        public string? DefaultCreditAccountCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateJournalDTO
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public JournalType Type { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public string? DefaultDebitAccountCode { get; set; }
        public string? DefaultCreditAccountCode { get; set; }
    }

    public class UpdateJournalDTO
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public JournalType Type { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public string? DefaultDebitAccountCode { get; set; }
        public string? DefaultCreditAccountCode { get; set; }
    }
    #endregion

    #region Partner DTOs
    public class PartnerDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public PartnerType Type { get; set; }
        public string? ICE { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; }
        public decimal CurrentBalance { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePartnerDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public PartnerType Type { get; set; }
        public string? ICE { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; } = "Tunisie";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }

    public class UpdatePartnerDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public PartnerType Type { get; set; }
        public string? ICE { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; }
        public bool IsActive { get; set; }
    }
    #endregion

    #region Invoice DTOs
    public class InvoiceDTO
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public int JournalId { get; set; }
        public string JournalName { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public InvoiceType Type { get; set; }
        public InvoiceStatus Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string? Notes { get; set; }
        public string? Reference { get; set; }
        public DateTime? PostedDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public List<InvoiceLineDTO> Lines { get; set; } = new List<InvoiceLineDTO>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateInvoiceDTO
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public int JournalId { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.Now;
        public DateTime? DueDate { get; set; }
        public InvoiceType Type { get; set; }
        public string? Notes { get; set; }
        public string? Reference { get; set; }
        public List<CreateInvoiceLineDTO> Lines { get; set; } = new List<CreateInvoiceLineDTO>();
    }

    public class UpdateInvoiceDTO
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public int JournalId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public InvoiceType Type { get; set; }
        public string? Notes { get; set; }
        public string? Reference { get; set; }
    }

    public class InvoiceLineDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? ProductCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal LineTotal { get; set; }
        public decimal VATRate { get; set; }
        public decimal VATAmount { get; set; }
        public decimal LineTotalWithVAT { get; set; }
        public string? Unit { get; set; }
        public string? AccountCode { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateInvoiceLineDTO
    {
        public string Description { get; set; } = string.Empty;
        public string? ProductCode { get; set; }
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0;
        public decimal Discount { get; set; } = 0;
        public decimal VATRate { get; set; } = 0;
        public string? Unit { get; set; } = "Unité";
        public string? AccountCode { get; set; }
        public string? Notes { get; set; }
    }
    #endregion

    #region Payment DTOs
    public class PaymentDTO
    {
        public int Id { get; set; }
        public string PaymentNumber { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public int JournalId { get; set; }
        public string JournalName { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public PaymentType Type { get; set; }
        public PaymentStatus Status { get; set; }
        public decimal Amount { get; set; }
        public App.Models.Financial.PaymentMethod Method { get; set; }
        public string? BankReference { get; set; }
        public string? CheckNumber { get; set; }
        public string? Notes { get; set; }
        public DateTime? PostedDate { get; set; }
        public List<PaymentTrancheDTO> PaymentTranches { get; set; } = new List<PaymentTrancheDTO>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePaymentDTO
    {
        public string PaymentNumber { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public int JournalId { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public PaymentType Type { get; set; }
        public decimal Amount { get; set; } = 0;
        public App.Models.Financial.PaymentMethod Method { get; set; }
        public string? BankReference { get; set; }
        public string? CheckNumber { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdatePaymentDTO
    {
        public string PaymentNumber { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public int JournalId { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentType Type { get; set; }
        public decimal Amount { get; set; }
        public App.Models.Financial.PaymentMethod Method { get; set; }
        public string? BankReference { get; set; }
        public string? CheckNumber { get; set; }
        public string? Notes { get; set; }
    }

    public class PaymentTrancheDTO
    {
        public int Id { get; set; }
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public TrancheStatus Status { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
        public DateTime? PostedDate { get; set; }
    }

    public class CreatePaymentTrancheDTO
    {
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public decimal Amount { get; set; } = 0;
        public string? Reference { get; set; }
        public string? Notes { get; set; }
    }
    #endregion

    #region Journal Entry DTOs
    public class JournalEntryDTO
    {
        public int Id { get; set; }
        public string Reference { get; set; } = string.Empty;
        public int JournalId { get; set; }
        public string JournalName { get; set; } = string.Empty;
        public int AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public int? PartnerId { get; set; }
        public string? PartnerName { get; set; }
        public int? InvoiceId { get; set; }
        public int? PaymentId { get; set; }
        public DateTime EntryDate { get; set; }
        public EntryType Type { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Description { get; set; }
        public string? DocumentReference { get; set; }
        public bool IsPosted { get; set; }
        public DateTime? PostedDate { get; set; }
        public string? CreatedBy { get; set; }
    }
    #endregion

    #region VAT DTOs
    public class VATDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public string? AccountCode { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }

    public class CreateVATDTO
    {
        public string Name { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public string? AccountCode { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }

    public class UpdateVATDTO
    {
        public string Name { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public string? AccountCode { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
    #endregion

    #region Search and Dashboard DTOs
    public class FinancialSearchDTO
    {
        public string? SearchTerm { get; set; }
        public AccountType? AccountType { get; set; }
        public JournalType? JournalType { get; set; }
        public PartnerType? PartnerType { get; set; }
        public InvoiceType? InvoiceType { get; set; }
        public InvoiceStatus? InvoiceStatus { get; set; }
        public PaymentType? PaymentType { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
        public int? PartnerId { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public bool? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }

    public class FinancialDashboardDTO
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }
        public int OverdueInvoices { get; set; }
        public int TotalAccounts { get; set; }
        public int TotalJournals { get; set; }
        public int TotalPartners { get; set; }
        public int TotalInvoices { get; set; }
        public int TotalPayments { get; set; }
        public int PendingPayments { get; set; }
        public List<RecentTransactionDTO> RecentTransactions { get; set; } = new List<RecentTransactionDTO>();
        public List<AccountBalanceDTO> AccountBalances { get; set; } = new List<AccountBalanceDTO>();
    }

    public class RecentTransactionDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string? PartnerName { get; set; }
    }

    public class AccountBalanceDTO
    {
        public int AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }
    #endregion
}

