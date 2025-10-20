using App.Data.Interfaces;
using App.Models.DTOs;

namespace App.Services
{
    public class FinancialService
    {
        private readonly IFinancialDAO _financialDAO;

        public FinancialService(IFinancialDAO financialDAO)
        {
            _financialDAO = financialDAO;
        }

        // Account operations
        public async Task<List<AccountDTO>> GetAllAccountsAsync()
        {
            return await _financialDAO.GetAllAccountsAsync();
        }

        public async Task<AccountDTO?> GetAccountByIdAsync(int id)
        {
            return await _financialDAO.GetAccountByIdAsync(id);
        }

        public async Task<AccountDTO> CreateAccountAsync(CreateAccountDTO account)
        {
            // Validate account code uniqueness
            var existingAccount = await _financialDAO.GetAllAccountsAsync();
            if (existingAccount.Any(a => a.Code == account.Code))
                throw new ArgumentException("Account code already exists");

            return await _financialDAO.CreateAccountAsync(account);
        }

        public async Task<AccountDTO> UpdateAccountAsync(int id, UpdateAccountDTO account)
        {
            // Validate account code uniqueness (excluding current account)
            var existingAccounts = await _financialDAO.GetAllAccountsAsync();
            if (existingAccounts.Any(a => a.Code == account.Code && a.Id != id))
                throw new ArgumentException("Account code already exists");

            return await _financialDAO.UpdateAccountAsync(id, account);
        }

        public async Task<bool> DeleteAccountAsync(int id)
        {
            return await _financialDAO.DeleteAccountAsync(id);
        }

        public async Task<List<AccountDTO>> GetAccountsByTypeAsync(string type)
        {
            return await _financialDAO.GetAccountsByTypeAsync(type);
        }

        public async Task<List<AccountDTO>> GetChildAccountsAsync(int parentId)
        {
            return await _financialDAO.GetChildAccountsAsync(parentId);
        }

        // Journal Entry operations
        public async Task<List<JournalEntryDTO>> GetAllJournalEntriesAsync()
        {
            return await _financialDAO.GetAllJournalEntriesAsync();
        }

        public async Task<JournalEntryDTO?> GetJournalEntryByIdAsync(int id)
        {
            return await _financialDAO.GetJournalEntryByIdAsync(id);
        }

        public async Task<JournalEntryDTO> CreateJournalEntryAsync(CreateJournalEntryDTO journalEntry)
        {
            // Validate journal entry
            ValidateJournalEntry(journalEntry);

            return await _financialDAO.CreateJournalEntryAsync(journalEntry);
        }

        public async Task<JournalEntryDTO> UpdateJournalEntryAsync(int id, UpdateJournalEntryDTO journalEntry)
        {
            // Validate journal entry
            ValidateJournalEntry(journalEntry);

            return await _financialDAO.UpdateJournalEntryAsync(id, journalEntry);
        }

        public async Task<bool> DeleteJournalEntryAsync(int id)
        {
            return await _financialDAO.DeleteJournalEntryAsync(id);
        }

        public async Task<bool> PostJournalEntryAsync(int id, int userId)
        {
            return await _financialDAO.PostJournalEntryAsync(id, userId);
        }

        public async Task<bool> ReverseJournalEntryAsync(int id, int userId)
        {
            return await _financialDAO.ReverseJournalEntryAsync(id, userId);
        }

        public async Task<List<JournalEntryDTO>> GetJournalEntriesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _financialDAO.GetJournalEntriesByDateRangeAsync(startDate, endDate);
        }

        // Bank Account operations
        public async Task<List<BankAccountDTO>> GetAllBankAccountsAsync()
        {
            return await _financialDAO.GetAllBankAccountsAsync();
        }

        public async Task<BankAccountDTO?> GetBankAccountByIdAsync(int id)
        {
            return await _financialDAO.GetBankAccountByIdAsync(id);
        }

        public async Task<BankAccountDTO> CreateBankAccountAsync(CreateBankAccountDTO bankAccount)
        {
            return await _financialDAO.CreateBankAccountAsync(bankAccount);
        }

        public async Task<BankAccountDTO> UpdateBankAccountAsync(int id, UpdateBankAccountDTO bankAccount)
        {
            return await _financialDAO.UpdateBankAccountAsync(id, bankAccount);
        }

        public async Task<bool> DeleteBankAccountAsync(int id)
        {
            return await _financialDAO.DeleteBankAccountAsync(id);
        }

        public async Task<bool> UpdateBankAccountBalanceAsync(int id, decimal newBalance)
        {
            return await _financialDAO.UpdateBankAccountBalanceAsync(id, newBalance);
        }

        // Financial Reports
        public async Task<List<TrialBalanceDTO>> GetTrialBalanceAsync(DateTime asOfDate)
        {
            return await _financialDAO.GetTrialBalanceAsync(asOfDate);
        }

        public async Task<List<ProfitLossDTO>> GetProfitLossAsync(DateTime startDate, DateTime endDate)
        {
            return await _financialDAO.GetProfitLossAsync(startDate, endDate);
        }

        public async Task<List<BalanceSheetDTO>> GetBalanceSheetAsync(DateTime asOfDate)
        {
            return await _financialDAO.GetBalanceSheetAsync(asOfDate);
        }

        public async Task<decimal> GetAccountBalanceAsync(int accountId, DateTime asOfDate)
        {
            return await _financialDAO.GetAccountBalanceAsync(accountId, asOfDate);
        }

        // Helper methods
        private void ValidateJournalEntry(CreateJournalEntryDTO journalEntry)
        {
            if (journalEntry.Lines.Count < 2)
                throw new ArgumentException("Journal entry must have at least 2 lines");

            var totalDebits = journalEntry.Lines.Sum(l => l.DebitAmount);
            var totalCredits = journalEntry.Lines.Sum(l => l.CreditAmount);

            if (Math.Abs(totalDebits - totalCredits) > 0.01m)
                throw new ArgumentException("Total debits must equal total credits");

            // Check that each line has either debit or credit, not both
            foreach (var line in journalEntry.Lines)
            {
                if (line.DebitAmount > 0 && line.CreditAmount > 0)
                    throw new ArgumentException("Each line must have either debit or credit amount, not both");

                if (line.DebitAmount == 0 && line.CreditAmount == 0)
                    throw new ArgumentException("Each line must have either debit or credit amount");
            }
        }

        private void ValidateJournalEntry(UpdateJournalEntryDTO journalEntry)
        {
            if (journalEntry.Lines.Count < 2)
                throw new ArgumentException("Journal entry must have at least 2 lines");

            var totalDebits = journalEntry.Lines.Sum(l => l.DebitAmount);
            var totalCredits = journalEntry.Lines.Sum(l => l.CreditAmount);

            if (Math.Abs(totalDebits - totalCredits) > 0.01m)
                throw new ArgumentException("Total debits must equal total credits");

            // Check that each line has either debit or credit, not both
            foreach (var line in journalEntry.Lines)
            {
                if (line.DebitAmount > 0 && line.CreditAmount > 0)
                    throw new ArgumentException("Each line must have either debit or credit amount, not both");

                if (line.DebitAmount == 0 && line.CreditAmount == 0)
                    throw new ArgumentException("Each line must have either debit or credit amount");
            }
        }

        // Business logic methods
        public async Task<JournalEntryDTO> CreateSalesInvoiceEntryAsync(int invoiceId, decimal amount, int clientId)
        {
            var accounts = await _financialDAO.GetAllAccountsAsync();
            var accountsReceivable = accounts.FirstOrDefault(a => a.Type == "Asset" && a.Name.Contains("Accounts Receivable"));
            var salesRevenue = accounts.FirstOrDefault(a => a.Type == "Revenue" && a.Name.Contains("Sales"));

            if (accountsReceivable == null || salesRevenue == null)
                throw new InvalidOperationException("Required accounts not found in chart of accounts");

            var journalEntry = new CreateJournalEntryDTO
            {
                Date = DateTime.Now,
                Reference = $"INV-{invoiceId}",
                Description = $"Sales invoice #{invoiceId}",
                Lines = new List<CreateJournalEntryLineDTO>
                {
                    new CreateJournalEntryLineDTO
                    {
                        AccountId = accountsReceivable.Id,
                        DebitAmount = amount,
                        Description = $"Sales invoice #{invoiceId}",
                        RelatedEntityType = "Invoice",
                        RelatedEntityId = invoiceId
                    },
                    new CreateJournalEntryLineDTO
                    {
                        AccountId = salesRevenue.Id,
                        CreditAmount = amount,
                        Description = $"Sales revenue for invoice #{invoiceId}",
                        RelatedEntityType = "Invoice",
                        RelatedEntityId = invoiceId
                    }
                }
            };

            return await _financialDAO.CreateJournalEntryAsync(journalEntry);
        }

        public async Task<JournalEntryDTO> CreatePaymentReceivedEntryAsync(int paymentId, decimal amount, int bankAccountId, int clientId)
        {
            var accounts = await _financialDAO.GetAllAccountsAsync();
            var bankAccount = accounts.FirstOrDefault(a => a.Id == bankAccountId);
            var accountsReceivable = accounts.FirstOrDefault(a => a.Type == "Asset" && a.Name.Contains("Accounts Receivable"));

            if (bankAccount == null || accountsReceivable == null)
                throw new InvalidOperationException("Required accounts not found in chart of accounts");

            var journalEntry = new CreateJournalEntryDTO
            {
                Date = DateTime.Now,
                Reference = $"PAY-{paymentId}",
                Description = $"Payment received #{paymentId}",
                Lines = new List<CreateJournalEntryLineDTO>
                {
                    new CreateJournalEntryLineDTO
                    {
                        AccountId = bankAccountId,
                        DebitAmount = amount,
                        Description = $"Payment received #{paymentId}",
                        RelatedEntityType = "Payment",
                        RelatedEntityId = paymentId
                    },
                    new CreateJournalEntryLineDTO
                    {
                        AccountId = accountsReceivable.Id,
                        CreditAmount = amount,
                        Description = $"Payment received #{paymentId}",
                        RelatedEntityType = "Payment",
                        RelatedEntityId = paymentId
                    }
                }
            };

            return await _financialDAO.CreateJournalEntryAsync(journalEntry);
        }
    }
}
