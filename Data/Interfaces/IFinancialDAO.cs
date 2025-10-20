using App.Models;
using App.Models.DTOs;

namespace App.Data.Interfaces
{
    public interface IFinancialDAO
    {
        // Account operations
        Task<List<AccountDTO>> GetAllAccountsAsync();
        Task<AccountDTO?> GetAccountByIdAsync(int id);
        Task<AccountDTO> CreateAccountAsync(CreateAccountDTO account);
        Task<AccountDTO> UpdateAccountAsync(int id, UpdateAccountDTO account);
        Task<bool> DeleteAccountAsync(int id);
        Task<List<AccountDTO>> GetAccountsByTypeAsync(string type);
        Task<List<AccountDTO>> GetChildAccountsAsync(int parentId);

        // Journal Entry operations
        Task<List<JournalEntryDTO>> GetAllJournalEntriesAsync();
        Task<JournalEntryDTO?> GetJournalEntryByIdAsync(int id);
        Task<JournalEntryDTO> CreateJournalEntryAsync(CreateJournalEntryDTO journalEntry);
        Task<JournalEntryDTO> UpdateJournalEntryAsync(int id, UpdateJournalEntryDTO journalEntry);
        Task<bool> DeleteJournalEntryAsync(int id);
        Task<bool> PostJournalEntryAsync(int id, int userId);
        Task<bool> ReverseJournalEntryAsync(int id, int userId);
        Task<List<JournalEntryDTO>> GetJournalEntriesByDateRangeAsync(DateTime startDate, DateTime endDate);

        // Bank Account operations
        Task<List<BankAccountDTO>> GetAllBankAccountsAsync();
        Task<BankAccountDTO?> GetBankAccountByIdAsync(int id);
        Task<BankAccountDTO> CreateBankAccountAsync(CreateBankAccountDTO bankAccount);
        Task<BankAccountDTO> UpdateBankAccountAsync(int id, UpdateBankAccountDTO bankAccount);
        Task<bool> DeleteBankAccountAsync(int id);
        Task<bool> UpdateBankAccountBalanceAsync(int id, decimal newBalance);

        // Financial Reports
        Task<List<TrialBalanceDTO>> GetTrialBalanceAsync(DateTime asOfDate);
        Task<List<ProfitLossDTO>> GetProfitLossAsync(DateTime startDate, DateTime endDate);
        Task<List<BalanceSheetDTO>> GetBalanceSheetAsync(DateTime asOfDate);
        Task<decimal> GetAccountBalanceAsync(int accountId, DateTime asOfDate);
    }
}
