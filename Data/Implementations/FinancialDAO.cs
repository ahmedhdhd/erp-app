using Microsoft.EntityFrameworkCore;
using App.Models;
using App.Models.DTOs;
using App.Data.Interfaces;

namespace App.Data.Implementations
{
    public class FinancialDAO : IFinancialDAO
    {
        private readonly ApplicationDbContext _context;

        public FinancialDAO(ApplicationDbContext context)
        {
            _context = context;
        }

        // Account operations
        public async Task<List<AccountDTO>> GetAllAccountsAsync()
        {
            return await _context.Accounts
                .Where(a => a.IsActive)
                .Select(a => new AccountDTO
                {
                    Id = a.Id,
                    Code = a.Code,
                    Name = a.Name,
                    Type = a.Type,
                    ParentId = a.ParentId,
                    ParentName = a.Parent != null ? a.Parent.Name : null,
                    Level = a.Level,
                    IsActive = a.IsActive,
                    Description = a.Description
                })
                .OrderBy(a => a.Code)
                .ToListAsync();
        }

        public async Task<AccountDTO?> GetAccountByIdAsync(int id)
        {
            var account = await _context.Accounts
                .Include(a => a.Parent)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (account == null) return null;

            return new AccountDTO
            {
                Id = account.Id,
                Code = account.Code,
                Name = account.Name,
                Type = account.Type,
                ParentId = account.ParentId,
                ParentName = account.Parent?.Name,
                Level = account.Level,
                IsActive = account.IsActive,
                Description = account.Description
            };
        }

        public async Task<AccountDTO> CreateAccountAsync(CreateAccountDTO accountDto)
        {
            var account = new Account
            {
                Code = accountDto.Code,
                Name = accountDto.Name,
                Type = accountDto.Type,
                ParentId = accountDto.ParentId,
                Description = accountDto.Description,
                Level = accountDto.ParentId.HasValue ? 
                    (await _context.Accounts.FindAsync(accountDto.ParentId.Value))?.Level + 1 ?? 1 : 1
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return await GetAccountByIdAsync(account.Id) ?? throw new Exception("Failed to retrieve created account");
        }

        public async Task<AccountDTO> UpdateAccountAsync(int id, UpdateAccountDTO accountDto)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) throw new ArgumentException("Account not found");

            account.Code = accountDto.Code;
            account.Name = accountDto.Name;
            account.Type = accountDto.Type;
            account.ParentId = accountDto.ParentId;
            account.Description = accountDto.Description;
            account.IsActive = accountDto.IsActive;

            await _context.SaveChangesAsync();
            return await GetAccountByIdAsync(id) ?? throw new Exception("Failed to retrieve updated account");
        }

        public async Task<bool> DeleteAccountAsync(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) return false;

            // Check if account has children
            var hasChildren = await _context.Accounts.AnyAsync(a => a.ParentId == id);
            if (hasChildren) throw new InvalidOperationException("Cannot delete account with child accounts");

            // Check if account has journal entry lines
            var hasEntries = await _context.JournalEntryLines.AnyAsync(j => j.AccountId == id);
            if (hasEntries) throw new InvalidOperationException("Cannot delete account with journal entries");

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<AccountDTO>> GetAccountsByTypeAsync(string type)
        {
            return await _context.Accounts
                .Where(a => a.Type == type && a.IsActive)
                .Select(a => new AccountDTO
                {
                    Id = a.Id,
                    Code = a.Code,
                    Name = a.Name,
                    Type = a.Type,
                    ParentId = a.ParentId,
                    Level = a.Level,
                    IsActive = a.IsActive,
                    Description = a.Description
                })
                .OrderBy(a => a.Code)
                .ToListAsync();
        }

        public async Task<List<AccountDTO>> GetChildAccountsAsync(int parentId)
        {
            return await _context.Accounts
                .Where(a => a.ParentId == parentId && a.IsActive)
                .Select(a => new AccountDTO
                {
                    Id = a.Id,
                    Code = a.Code,
                    Name = a.Name,
                    Type = a.Type,
                    ParentId = a.ParentId,
                    Level = a.Level,
                    IsActive = a.IsActive,
                    Description = a.Description
                })
                .OrderBy(a => a.Code)
                .ToListAsync();
        }

        // Journal Entry operations
        public async Task<List<JournalEntryDTO>> GetAllJournalEntriesAsync()
        {
            return await _context.JournalEntries
                .Include(j => j.CreatedByUser)
                .Include(j => j.PostedByUser)
                .Include(j => j.Lines)
                    .ThenInclude(l => l.Account)
                .Select(j => new JournalEntryDTO
                {
                    Id = j.Id,
                    Date = j.Date,
                    Reference = j.Reference,
                    Description = j.Description,
                    TotalAmount = j.TotalAmount,
                    Status = j.Status,
                    CreatedByUserName = j.CreatedByUser != null ? j.CreatedByUser.NomUtilisateur : null,
                    PostedDate = j.PostedDate,
                    PostedByUserName = j.PostedByUser != null ? j.PostedByUser.NomUtilisateur : null,
                    Lines = j.Lines.Select(l => new JournalEntryLineDTO
                    {
                        Id = l.Id,
                        JournalEntryId = l.JournalEntryId,
                        AccountId = l.AccountId,
                        AccountCode = l.Account.Code,
                        AccountName = l.Account.Name,
                        DebitAmount = l.DebitAmount,
                        CreditAmount = l.CreditAmount,
                        Description = l.Description,
                        RelatedEntityType = l.RelatedEntityType,
                        RelatedEntityId = l.RelatedEntityId
                    }).ToList()
                })
                .OrderByDescending(j => j.Date)
                .ToListAsync();
        }

        public async Task<JournalEntryDTO?> GetJournalEntryByIdAsync(int id)
        {
            var journalEntry = await _context.JournalEntries
                .Include(j => j.CreatedByUser)
                .Include(j => j.PostedByUser)
                .Include(j => j.Lines)
                    .ThenInclude(l => l.Account)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (journalEntry == null) return null;

            return new JournalEntryDTO
            {
                Id = journalEntry.Id,
                Date = journalEntry.Date,
                Reference = journalEntry.Reference,
                Description = journalEntry.Description,
                TotalAmount = journalEntry.TotalAmount,
                Status = journalEntry.Status,
                CreatedByUserName = journalEntry.CreatedByUser?.NomUtilisateur,
                PostedDate = journalEntry.PostedDate,
                PostedByUserName = journalEntry.PostedByUser?.NomUtilisateur,
                Lines = journalEntry.Lines.Select(l => new JournalEntryLineDTO
                {
                    Id = l.Id,
                    JournalEntryId = l.JournalEntryId,
                    AccountId = l.AccountId,
                    AccountCode = l.Account.Code,
                    AccountName = l.Account.Name,
                    DebitAmount = l.DebitAmount,
                    CreditAmount = l.CreditAmount,
                    Description = l.Description,
                    RelatedEntityType = l.RelatedEntityType,
                    RelatedEntityId = l.RelatedEntityId
                }).ToList()
            };
        }

        public async Task<JournalEntryDTO> CreateJournalEntryAsync(CreateJournalEntryDTO journalEntryDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate that debits equal credits
                var totalDebits = journalEntryDto.Lines.Sum(l => l.DebitAmount);
                var totalCredits = journalEntryDto.Lines.Sum(l => l.CreditAmount);
                
                if (Math.Abs(totalDebits - totalCredits) > 0.01m)
                    throw new InvalidOperationException("Total debits must equal total credits");

                var journalEntry = new JournalEntry
                {
                    Date = journalEntryDto.Date,
                    Reference = journalEntryDto.Reference,
                    Description = journalEntryDto.Description,
                    TotalAmount = totalDebits,
                    Status = "Draft"
                };

                _context.JournalEntries.Add(journalEntry);
                await _context.SaveChangesAsync();

                // Add lines
                foreach (var lineDto in journalEntryDto.Lines)
                {
                    var line = new JournalEntryLine
                    {
                        JournalEntryId = journalEntry.Id,
                        AccountId = lineDto.AccountId,
                        DebitAmount = lineDto.DebitAmount,
                        CreditAmount = lineDto.CreditAmount,
                        Description = lineDto.Description,
                        RelatedEntityType = lineDto.RelatedEntityType,
                        RelatedEntityId = lineDto.RelatedEntityId
                    };
                    _context.JournalEntryLines.Add(line);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetJournalEntryByIdAsync(journalEntry.Id) ?? throw new Exception("Failed to retrieve created journal entry");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<JournalEntryDTO> UpdateJournalEntryAsync(int id, UpdateJournalEntryDTO journalEntryDto)
        {
            var journalEntry = await _context.JournalEntries
                .Include(j => j.Lines)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (journalEntry == null) throw new ArgumentException("Journal entry not found");
            if (journalEntry.Status == "Posted") throw new InvalidOperationException("Cannot update posted journal entry");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate that debits equal credits
                var totalDebits = journalEntryDto.Lines.Sum(l => l.DebitAmount);
                var totalCredits = journalEntryDto.Lines.Sum(l => l.CreditAmount);
                
                if (Math.Abs(totalDebits - totalCredits) > 0.01m)
                    throw new InvalidOperationException("Total debits must equal total credits");

                // Update journal entry
                journalEntry.Date = journalEntryDto.Date;
                journalEntry.Reference = journalEntryDto.Reference;
                journalEntry.Description = journalEntryDto.Description;
                journalEntry.TotalAmount = totalDebits;

                // Remove existing lines
                _context.JournalEntryLines.RemoveRange(journalEntry.Lines);

                // Add new lines
                foreach (var lineDto in journalEntryDto.Lines)
                {
                    var line = new JournalEntryLine
                    {
                        JournalEntryId = journalEntry.Id,
                        AccountId = lineDto.AccountId,
                        DebitAmount = lineDto.DebitAmount,
                        CreditAmount = lineDto.CreditAmount,
                        Description = lineDto.Description,
                        RelatedEntityType = lineDto.RelatedEntityType,
                        RelatedEntityId = lineDto.RelatedEntityId
                    };
                    _context.JournalEntryLines.Add(line);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetJournalEntryByIdAsync(id) ?? throw new Exception("Failed to retrieve updated journal entry");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteJournalEntryAsync(int id)
        {
            var journalEntry = await _context.JournalEntries.FindAsync(id);
            if (journalEntry == null) return false;
            if (journalEntry.Status == "Posted") throw new InvalidOperationException("Cannot delete posted journal entry");

            _context.JournalEntries.Remove(journalEntry);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PostJournalEntryAsync(int id, int userId)
        {
            var journalEntry = await _context.JournalEntries.FindAsync(id);
            if (journalEntry == null) return false;
            if (journalEntry.Status != "Draft") throw new InvalidOperationException("Only draft journal entries can be posted");

            journalEntry.Status = "Posted";
            journalEntry.PostedDate = DateTime.UtcNow;
            journalEntry.PostedByUserId = userId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReverseJournalEntryAsync(int id, int userId)
        {
            var journalEntry = await _context.JournalEntries.FindAsync(id);
            if (journalEntry == null) return false;
            if (journalEntry.Status != "Posted") throw new InvalidOperationException("Only posted journal entries can be reversed");

            journalEntry.Status = "Reversed";
            journalEntry.PostedByUserId = userId; // Track who reversed it

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<JournalEntryDTO>> GetJournalEntriesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.JournalEntries
                .Where(j => j.Date >= startDate && j.Date <= endDate)
                .Include(j => j.CreatedByUser)
                .Include(j => j.PostedByUser)
                .Include(j => j.Lines)
                    .ThenInclude(l => l.Account)
                .Select(j => new JournalEntryDTO
                {
                    Id = j.Id,
                    Date = j.Date,
                    Reference = j.Reference,
                    Description = j.Description,
                    TotalAmount = j.TotalAmount,
                    Status = j.Status,
                    CreatedByUserName = j.CreatedByUser != null ? j.CreatedByUser.NomUtilisateur : null,
                    PostedDate = j.PostedDate,
                    PostedByUserName = j.PostedByUser != null ? j.PostedByUser.NomUtilisateur : null,
                    Lines = j.Lines.Select(l => new JournalEntryLineDTO
                    {
                        Id = l.Id,
                        JournalEntryId = l.JournalEntryId,
                        AccountId = l.AccountId,
                        AccountCode = l.Account.Code,
                        AccountName = l.Account.Name,
                        DebitAmount = l.DebitAmount,
                        CreditAmount = l.CreditAmount,
                        Description = l.Description,
                        RelatedEntityType = l.RelatedEntityType,
                        RelatedEntityId = l.RelatedEntityId
                    }).ToList()
                })
                .OrderByDescending(j => j.Date)
                .ToListAsync();
        }

        // Bank Account operations
        public async Task<List<BankAccountDTO>> GetAllBankAccountsAsync()
        {
            return await _context.BankAccounts
                .Where(b => b.IsActive)
                .Select(b => new BankAccountDTO
                {
                    Id = b.Id,
                    AccountNumber = b.AccountNumber,
                    BankName = b.BankName,
                    AccountName = b.AccountName,
                    Currency = b.Currency,
                    Balance = b.Balance,
                    IsActive = b.IsActive,
                    Description = b.Description
                })
                .OrderBy(b => b.BankName)
                .ThenBy(b => b.AccountName)
                .ToListAsync();
        }

        public async Task<BankAccountDTO?> GetBankAccountByIdAsync(int id)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(id);
            if (bankAccount == null) return null;

            return new BankAccountDTO
            {
                Id = bankAccount.Id,
                AccountNumber = bankAccount.AccountNumber,
                BankName = bankAccount.BankName,
                AccountName = bankAccount.AccountName,
                Currency = bankAccount.Currency,
                Balance = bankAccount.Balance,
                IsActive = bankAccount.IsActive,
                Description = bankAccount.Description
            };
        }

        public async Task<BankAccountDTO> CreateBankAccountAsync(CreateBankAccountDTO bankAccountDto)
        {
            var bankAccount = new BankAccount
            {
                AccountNumber = bankAccountDto.AccountNumber,
                BankName = bankAccountDto.BankName,
                AccountName = bankAccountDto.AccountName,
                Currency = bankAccountDto.Currency,
                Description = bankAccountDto.Description
            };

            _context.BankAccounts.Add(bankAccount);
            await _context.SaveChangesAsync();

            return await GetBankAccountByIdAsync(bankAccount.Id) ?? throw new Exception("Failed to retrieve created bank account");
        }

        public async Task<BankAccountDTO> UpdateBankAccountAsync(int id, UpdateBankAccountDTO bankAccountDto)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(id);
            if (bankAccount == null) throw new ArgumentException("Bank account not found");

            bankAccount.AccountNumber = bankAccountDto.AccountNumber;
            bankAccount.BankName = bankAccountDto.BankName;
            bankAccount.AccountName = bankAccountDto.AccountName;
            bankAccount.Currency = bankAccountDto.Currency;
            bankAccount.Description = bankAccountDto.Description;
            bankAccount.IsActive = bankAccountDto.IsActive;

            await _context.SaveChangesAsync();
            return await GetBankAccountByIdAsync(id) ?? throw new Exception("Failed to retrieve updated bank account");
        }

        public async Task<bool> DeleteBankAccountAsync(int id)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(id);
            if (bankAccount == null) return false;

            _context.BankAccounts.Remove(bankAccount);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateBankAccountBalanceAsync(int id, decimal newBalance)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(id);
            if (bankAccount == null) return false;

            bankAccount.Balance = newBalance;
            await _context.SaveChangesAsync();
            return true;
        }

        // Financial Reports
        public async Task<List<TrialBalanceDTO>> GetTrialBalanceAsync(DateTime asOfDate)
        {
            return await _context.Accounts
                .Where(a => a.IsActive)
                .Select(a => new TrialBalanceDTO
                {
                    AccountCode = a.Code,
                    AccountName = a.Name,
                    DebitBalance = _context.JournalEntryLines
                        .Where(l => l.AccountId == a.Id && l.JournalEntry.Date <= asOfDate && l.JournalEntry.Status == "Posted")
                        .Sum(l => l.DebitAmount),
                    CreditBalance = _context.JournalEntryLines
                        .Where(l => l.AccountId == a.Id && l.JournalEntry.Date <= asOfDate && l.JournalEntry.Status == "Posted")
                        .Sum(l => l.CreditAmount)
                })
                .Where(tb => tb.DebitBalance != 0 || tb.CreditBalance != 0)
                .OrderBy(tb => tb.AccountCode)
                .ToListAsync();
        }

        public async Task<List<ProfitLossDTO>> GetProfitLossAsync(DateTime startDate, DateTime endDate)
        {
            var revenueAccounts = await _context.Accounts
                .Where(a => a.Type == "Revenue" && a.IsActive)
                .Select(a => new ProfitLossDTO
                {
                    AccountCode = a.Code,
                    AccountName = a.Name,
                    Amount = _context.JournalEntryLines
                        .Where(l => l.AccountId == a.Id && l.JournalEntry.Date >= startDate && l.JournalEntry.Date <= endDate && l.JournalEntry.Status == "Posted")
                        .Sum(l => l.CreditAmount - l.DebitAmount),
                    Type = "Revenue"
                })
                .Where(pl => pl.Amount != 0)
                .ToListAsync();

            var expenseAccounts = await _context.Accounts
                .Where(a => a.Type == "Expense" && a.IsActive)
                .Select(a => new ProfitLossDTO
                {
                    AccountCode = a.Code,
                    AccountName = a.Name,
                    Amount = _context.JournalEntryLines
                        .Where(l => l.AccountId == a.Id && l.JournalEntry.Date >= startDate && l.JournalEntry.Date <= endDate && l.JournalEntry.Status == "Posted")
                        .Sum(l => l.DebitAmount - l.CreditAmount),
                    Type = "Expense"
                })
                .Where(pl => pl.Amount != 0)
                .ToListAsync();

            return revenueAccounts.Concat(expenseAccounts).OrderBy(pl => pl.Type).ThenBy(pl => pl.AccountCode).ToList();
        }

        public async Task<List<BalanceSheetDTO>> GetBalanceSheetAsync(DateTime asOfDate)
        {
            return await _context.Accounts
                .Where(a => (a.Type == "Asset" || a.Type == "Liability" || a.Type == "Equity") && a.IsActive)
                .Select(a => new BalanceSheetDTO
                {
                    AccountCode = a.Code,
                    AccountName = a.Name,
                    Balance = a.Type == "Asset" 
                        ? _context.JournalEntryLines
                            .Where(l => l.AccountId == a.Id && l.JournalEntry.Date <= asOfDate && l.JournalEntry.Status == "Posted")
                            .Sum(l => l.DebitAmount - l.CreditAmount)
                        : _context.JournalEntryLines
                            .Where(l => l.AccountId == a.Id && l.JournalEntry.Date <= asOfDate && l.JournalEntry.Status == "Posted")
                            .Sum(l => l.CreditAmount - l.DebitAmount),
                    Type = a.Type
                })
                .Where(bs => bs.Balance != 0)
                .OrderBy(bs => bs.Type).ThenBy(bs => bs.AccountCode)
                .ToListAsync();
        }

        public async Task<decimal> GetAccountBalanceAsync(int accountId, DateTime asOfDate)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null) return 0;

            var debitBalance = await _context.JournalEntryLines
                .Where(l => l.AccountId == accountId && l.JournalEntry.Date <= asOfDate && l.JournalEntry.Status == "Posted")
                .SumAsync(l => l.DebitAmount);

            var creditBalance = await _context.JournalEntryLines
                .Where(l => l.AccountId == accountId && l.JournalEntry.Date <= asOfDate && l.JournalEntry.Status == "Posted")
                .SumAsync(l => l.CreditAmount);

            // For Asset and Expense accounts, balance = Debits - Credits
            // For Liability, Equity, and Revenue accounts, balance = Credits - Debits
            if (account.Type == "Asset" || account.Type == "Expense")
                return debitBalance - creditBalance;
            else
                return creditBalance - debitBalance;
        }
    }
}
