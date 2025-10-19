using App.Data;
using App.Models;
using App.Models.DTOs;
using App.Models.Financial;
using Microsoft.EntityFrameworkCore;

namespace App.Services
{
    public class FinancialService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FinancialService> _logger;

        public FinancialService(ApplicationDbContext context, ILogger<FinancialService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Dashboard
        public async Task<FinancialDashboardDTO> GetDashboardDataAsync()
        {
            try
            {
                var totalRevenue = await _context.Invoices
                    .Where(i => i.Status == InvoiceStatus.Posted && i.Type == InvoiceType.Sales)
                    .SumAsync(i => i.TotalAmount);

                var totalExpenses = await _context.Invoices
                    .Where(i => i.Status == InvoiceStatus.Posted && i.Type == InvoiceType.Purchase)
                    .SumAsync(i => i.TotalAmount);

                var overdueInvoices = await _context.Invoices
                    .Where(i => i.Status != InvoiceStatus.Paid && i.DueDate < DateTime.Now)
                    .CountAsync();

                var totalAccounts = await _context.Accounts.CountAsync();
                var totalJournals = await _context.Journals.CountAsync();
                var totalPartners = await _context.Partners.CountAsync();
                var totalInvoices = await _context.Invoices.CountAsync();
                var totalPayments = await _context.Payments.CountAsync();
                var pendingPayments = await _context.Payments
                    .Where(p => p.Status == PaymentStatus.Draft)
                    .CountAsync();

                var recentTransactions = await _context.JournalEntries
                    .Include(je => je.Account)
                    .Include(je => je.Partner)
                    .OrderByDescending(je => je.EntryDate)
                    .Take(5)
                    .Select(je => new RecentTransactionDTO
                    {
                        Id = je.Id,
                        Description = je.Description ?? "Transaction",
                        Amount = je.Debit > 0 ? je.Debit : je.Credit,
                        Date = je.EntryDate,
                        AccountName = je.Account.Name,
                        PartnerName = je.Partner != null ? je.Partner.Name : null
                    })
                    .ToListAsync();

                var accountBalances = await _context.Accounts
                    .Where(a => a.IsActive)
                    .Select(a => new AccountBalanceDTO
                    {
                        AccountId = a.Id,
                        AccountName = a.Name,
                        AccountCode = a.Code,
                        Balance = a.Balance
                    })
                    .ToListAsync();

                return new FinancialDashboardDTO
                {
                    TotalRevenue = totalRevenue,
                    TotalExpenses = totalExpenses,
                    NetProfit = totalRevenue - totalExpenses,
                    OverdueInvoices = overdueInvoices,
                    TotalAccounts = totalAccounts,
                    TotalJournals = totalJournals,
                    TotalPartners = totalPartners,
                    TotalInvoices = totalInvoices,
                    TotalPayments = totalPayments,
                    PendingPayments = pendingPayments,
                    RecentTransactions = recentTransactions,
                    AccountBalances = accountBalances
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard data");
                throw;
            }
        }
        #endregion

        #region Accounts
        public async Task<List<AccountDTO>> GetAccountsAsync(FinancialSearchDTO searchDTO)
        {
            try
            {
                var query = _context.Accounts.AsQueryable();

                if (!string.IsNullOrEmpty(searchDTO.SearchTerm))
                {
                    query = query.Where(a => a.Name.Contains(searchDTO.SearchTerm) || 
                                           a.Code.Contains(searchDTO.SearchTerm));
                }

                if (searchDTO.AccountType.HasValue)
                {
                    query = query.Where(a => a.Type == searchDTO.AccountType.Value);
                }

                if (searchDTO.IsActive.HasValue)
                {
                    query = query.Where(a => a.IsActive == searchDTO.IsActive.Value);
                }

                var accounts = await query
                    .OrderBy(a => a.Code)
                    .Select(a => new AccountDTO
                    {
                        Id = a.Id,
                        Code = a.Code,
                        Name = a.Name,
                        Type = a.Type,
                        Description = a.Description,
                        IsActive = a.IsActive,
                        ParentAccountId = a.ParentAccountId,
                        Balance = a.Balance,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt ?? DateTime.Now
                    })
                    .ToListAsync();

                return accounts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accounts");
                throw;
            }
        }

        public async Task<AccountDTO?> GetAccountByIdAsync(int id)
        {
            try
            {
                var account = await _context.Accounts
                    .Include(a => a.ParentAccount)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (account == null) return null;

                return new AccountDTO
                {
                    Id = account.Id,
                    Code = account.Code,
                    Name = account.Name,
                    Type = account.Type,
                    Description = account.Description,
                    IsActive = account.IsActive,
                    ParentAccountId = account.ParentAccountId,
                    Balance = account.Balance,
                    CreatedAt = account.CreatedAt,
                    UpdatedAt = account.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account by id {AccountId}", id);
                throw;
            }
        }

        public async Task<AccountDTO> CreateAccountAsync(CreateAccountDTO createDTO)
        {
            try
            {
                var account = new Account
                {
                    Code = createDTO.Code,
                    Name = createDTO.Name,
                    Type = createDTO.Type,
                    Description = createDTO.Description,
                    IsActive = createDTO.IsActive,
                    ParentAccountId = createDTO.ParentAccountId
                };

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                return new AccountDTO
                {
                    Id = account.Id,
                    Code = account.Code,
                    Name = account.Name,
                    Type = account.Type,
                    Description = account.Description,
                    IsActive = account.IsActive,
                    ParentAccountId = account.ParentAccountId,
                    Balance = account.Balance,
                    CreatedAt = account.CreatedAt,
                    UpdatedAt = account.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating account");
                throw;
            }
        }

        public async Task<AccountDTO> UpdateAccountAsync(int id, UpdateAccountDTO updateDTO)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(id);
                if (account == null)
                    throw new ArgumentException("Account not found");

                account.Code = updateDTO.Code;
                account.Name = updateDTO.Name;
                account.Type = updateDTO.Type;
                account.Description = updateDTO.Description;
                account.IsActive = updateDTO.IsActive;
                account.ParentAccountId = updateDTO.ParentAccountId;
                account.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return new AccountDTO
                {
                    Id = account.Id,
                    Code = account.Code,
                    Name = account.Name,
                    Type = account.Type,
                    Description = account.Description,
                    IsActive = account.IsActive,
                    ParentAccountId = account.ParentAccountId,
                    Balance = account.Balance,
                    CreatedAt = account.CreatedAt,
                    UpdatedAt = account.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account {AccountId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAccountAsync(int id)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(id);
                if (account == null) return false;

                // Check if account has journal entries
                var hasEntries = await _context.JournalEntries.AnyAsync(je => je.AccountId == id);
                if (hasEntries)
                {
                    // Soft delete - just deactivate
                    account.IsActive = false;
                    account.UpdatedAt = DateTime.Now;
                }
                else
                {
                    // Hard delete
                    _context.Accounts.Remove(account);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting account {AccountId}", id);
                throw;
            }
        }
        #endregion

        #region Journals
        public async Task<List<JournalDTO>> GetJournalsAsync(FinancialSearchDTO searchDTO)
        {
            try
            {
                var query = _context.Journals.AsQueryable();

                if (!string.IsNullOrEmpty(searchDTO.SearchTerm))
                {
                    query = query.Where(j => j.Name.Contains(searchDTO.SearchTerm) || 
                                           j.Code.Contains(searchDTO.SearchTerm));
                }

                if (searchDTO.JournalType.HasValue)
                {
                    query = query.Where(j => j.Type == searchDTO.JournalType.Value);
                }

                if (searchDTO.IsActive.HasValue)
                {
                    query = query.Where(j => j.IsActive == searchDTO.IsActive.Value);
                }

                var journals = await query
                    .OrderBy(j => j.Code)
                    .Select(j => new JournalDTO
                    {
                        Id = j.Id,
                        Code = j.Code,
                        Name = j.Name,
                        Type = j.Type,
                        Description = j.Description,
                        IsActive = j.IsActive,
                        DefaultDebitAccountCode = j.DefaultDebitAccountCode,
                        DefaultCreditAccountCode = j.DefaultCreditAccountCode,
                        CreatedAt = j.CreatedAt,
                        UpdatedAt = j.UpdatedAt ?? DateTime.Now
                    })
                    .ToListAsync();

                return journals;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journals");
                throw;
            }
        }

        public async Task<JournalDTO?> GetJournalByIdAsync(int id)
        {
            try
            {
                var journal = await _context.Journals.FindAsync(id);
                if (journal == null) return null;

                return new JournalDTO
                {
                    Id = journal.Id,
                    Code = journal.Code,
                    Name = journal.Name,
                    Type = journal.Type,
                    Description = journal.Description,
                    IsActive = journal.IsActive,
                    DefaultDebitAccountCode = journal.DefaultDebitAccountCode,
                    DefaultCreditAccountCode = journal.DefaultCreditAccountCode,
                    CreatedAt = journal.CreatedAt,
                    UpdatedAt = journal.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal by id {JournalId}", id);
                throw;
            }
        }

        public async Task<JournalDTO> CreateJournalAsync(CreateJournalDTO createDTO)
        {
            try
            {
                var journal = new Journal
                {
                    Code = createDTO.Code,
                    Name = createDTO.Name,
                    Type = createDTO.Type,
                    Description = createDTO.Description,
                    IsActive = createDTO.IsActive,
                    DefaultDebitAccountCode = createDTO.DefaultDebitAccountCode,
                    DefaultCreditAccountCode = createDTO.DefaultCreditAccountCode
                };

                _context.Journals.Add(journal);
                await _context.SaveChangesAsync();

                return new JournalDTO
                {
                    Id = journal.Id,
                    Code = journal.Code,
                    Name = journal.Name,
                    Type = journal.Type,
                    Description = journal.Description,
                    IsActive = journal.IsActive,
                    DefaultDebitAccountCode = journal.DefaultDebitAccountCode,
                    DefaultCreditAccountCode = journal.DefaultCreditAccountCode,
                    CreatedAt = journal.CreatedAt,
                    UpdatedAt = journal.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating journal");
                throw;
            }
        }

        public async Task<JournalDTO> UpdateJournalAsync(int id, UpdateJournalDTO updateDTO)
        {
            try
            {
                var journal = await _context.Journals.FindAsync(id);
                if (journal == null)
                    throw new ArgumentException("Journal not found");

                journal.Code = updateDTO.Code;
                journal.Name = updateDTO.Name;
                journal.Type = updateDTO.Type;
                journal.Description = updateDTO.Description;
                journal.IsActive = updateDTO.IsActive;
                journal.DefaultDebitAccountCode = updateDTO.DefaultDebitAccountCode;
                journal.DefaultCreditAccountCode = updateDTO.DefaultCreditAccountCode;
                journal.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return new JournalDTO
                {
                    Id = journal.Id,
                    Code = journal.Code,
                    Name = journal.Name,
                    Type = journal.Type,
                    Description = journal.Description,
                    IsActive = journal.IsActive,
                    DefaultDebitAccountCode = journal.DefaultDebitAccountCode,
                    DefaultCreditAccountCode = journal.DefaultCreditAccountCode,
                    CreatedAt = journal.CreatedAt,
                    UpdatedAt = journal.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating journal {JournalId}", id);
                throw;
            }
        }
        #endregion

        #region Partners
        public async Task<List<PartnerDTO>> GetPartnersAsync(FinancialSearchDTO searchDTO)
        {
            try
            {
                var query = _context.Partners.AsQueryable();

                if (!string.IsNullOrEmpty(searchDTO.SearchTerm))
                {
                    query = query.Where(p => p.Name.Contains(searchDTO.SearchTerm) || 
                                           p.Code.Contains(searchDTO.SearchTerm) ||
                                           p.ICE.Contains(searchDTO.SearchTerm));
                }

                if (searchDTO.PartnerType.HasValue)
                {
                    query = query.Where(p => p.Type == searchDTO.PartnerType.Value);
                }

                if (searchDTO.IsActive.HasValue)
                {
                    query = query.Where(p => p.IsActive == searchDTO.IsActive.Value);
                }

                var partners = await query
                    .OrderBy(p => p.Name)
                    .Select(p => new PartnerDTO
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Code = p.Code,
                        Type = p.Type,
                        ICE = p.ICE,
                        Address = p.Address,
                        City = p.City,
                        PostalCode = p.PostalCode,
                        Country = p.Country,
                        Phone = p.Phone,
                        Email = p.Email,
                        TaxNumber = p.TaxNumber,
                        CreditLimit = p.CreditLimit,
                        CurrentBalance = p.CurrentBalance,
                        TotalDebit = p.TotalDebit,
                        TotalCredit = p.TotalCredit,
                        IsActive = p.IsActive,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt ?? DateTime.Now
                    })
                    .ToListAsync();

                return partners;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting partners");
                throw;
            }
        }

        public async Task<PartnerDTO?> GetPartnerByIdAsync(int id)
        {
            try
            {
                var partner = await _context.Partners.FindAsync(id);
                if (partner == null) return null;

                return new PartnerDTO
                {
                    Id = partner.Id,
                    Name = partner.Name,
                    Code = partner.Code,
                    Type = partner.Type,
                    ICE = partner.ICE,
                    Address = partner.Address,
                    City = partner.City,
                    PostalCode = partner.PostalCode,
                    Country = partner.Country,
                    Phone = partner.Phone,
                    Email = partner.Email,
                    TaxNumber = partner.TaxNumber,
                    CreditLimit = partner.CreditLimit,
                    CurrentBalance = partner.CurrentBalance,
                    TotalDebit = partner.TotalDebit,
                    TotalCredit = partner.TotalCredit,
                    IsActive = partner.IsActive,
                    CreatedAt = partner.CreatedAt,
                    UpdatedAt = partner.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting partner by id {PartnerId}", id);
                throw;
            }
        }

        public async Task<PartnerDTO> CreatePartnerAsync(CreatePartnerDTO createDTO)
        {
            try
            {
                var partner = new Partner
                {
                    Name = createDTO.Name,
                    Code = createDTO.Code,
                    Type = createDTO.Type,
                    ICE = createDTO.ICE,
                    Address = createDTO.Address,
                    City = createDTO.City,
                    PostalCode = createDTO.PostalCode,
                    Country = createDTO.Country,
                    Phone = createDTO.Phone,
                    Email = createDTO.Email,
                    TaxNumber = createDTO.TaxNumber,
                    CreditLimit = createDTO.CreditLimit,
                    IsActive = createDTO.IsActive
                };

                _context.Partners.Add(partner);
                await _context.SaveChangesAsync();

                return new PartnerDTO
                {
                    Id = partner.Id,
                    Name = partner.Name,
                    Code = partner.Code,
                    Type = partner.Type,
                    ICE = partner.ICE,
                    Address = partner.Address,
                    City = partner.City,
                    PostalCode = partner.PostalCode,
                    Country = partner.Country,
                    Phone = partner.Phone,
                    Email = partner.Email,
                    TaxNumber = partner.TaxNumber,
                    CreditLimit = partner.CreditLimit,
                    CurrentBalance = partner.CurrentBalance,
                    TotalDebit = partner.TotalDebit,
                    TotalCredit = partner.TotalCredit,
                    IsActive = partner.IsActive,
                    CreatedAt = partner.CreatedAt,
                    UpdatedAt = partner.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating partner");
                throw;
            }
        }

        public async Task<PartnerDTO> UpdatePartnerAsync(int id, UpdatePartnerDTO updateDTO)
        {
            try
            {
                var partner = await _context.Partners.FindAsync(id);
                if (partner == null)
                    throw new ArgumentException("Partner not found");

                partner.Name = updateDTO.Name;
                partner.Code = updateDTO.Code;
                partner.Type = updateDTO.Type;
                partner.ICE = updateDTO.ICE;
                partner.Address = updateDTO.Address;
                partner.City = updateDTO.City;
                partner.PostalCode = updateDTO.PostalCode;
                partner.Country = updateDTO.Country;
                partner.Phone = updateDTO.Phone;
                partner.Email = updateDTO.Email;
                partner.TaxNumber = updateDTO.TaxNumber;
                partner.CreditLimit = updateDTO.CreditLimit;
                partner.IsActive = updateDTO.IsActive;
                partner.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return new PartnerDTO
                {
                    Id = partner.Id,
                    Name = partner.Name,
                    Code = partner.Code,
                    Type = partner.Type,
                    ICE = partner.ICE,
                    Address = partner.Address,
                    City = partner.City,
                    PostalCode = partner.PostalCode,
                    Country = partner.Country,
                    Phone = partner.Phone,
                    Email = partner.Email,
                    TaxNumber = partner.TaxNumber,
                    CreditLimit = partner.CreditLimit,
                    CurrentBalance = partner.CurrentBalance,
                    TotalDebit = partner.TotalDebit,
                    TotalCredit = partner.TotalCredit,
                    IsActive = partner.IsActive,
                    CreatedAt = partner.CreatedAt,
                    UpdatedAt = partner.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating partner {PartnerId}", id);
                throw;
            }
        }
        #endregion

        #region Invoices
        public async Task<List<InvoiceDTO>> GetInvoicesAsync(FinancialSearchDTO searchDTO)
        {
            try
            {
                var query = _context.Invoices
                    .Include(i => i.Partner)
                    .Include(i => i.Journal)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchDTO.SearchTerm))
                {
                    query = query.Where(i => i.InvoiceNumber.Contains(searchDTO.SearchTerm) ||
                                           i.Partner.Name.Contains(searchDTO.SearchTerm));
                }

                if (searchDTO.InvoiceType.HasValue)
                {
                    query = query.Where(i => i.Type == searchDTO.InvoiceType.Value);
                }

                if (searchDTO.InvoiceStatus.HasValue)
                {
                    query = query.Where(i => i.Status == searchDTO.InvoiceStatus.Value);
                }

                if (searchDTO.PartnerId.HasValue)
                {
                    query = query.Where(i => i.PartnerId == searchDTO.PartnerId.Value);
                }

                if (searchDTO.DateFrom.HasValue)
                {
                    query = query.Where(i => i.InvoiceDate >= searchDTO.DateFrom.Value);
                }

                if (searchDTO.DateTo.HasValue)
                {
                    query = query.Where(i => i.InvoiceDate <= searchDTO.DateTo.Value);
                }

                var invoices = await query
                    .OrderByDescending(i => i.InvoiceDate)
                    .Select(i => new InvoiceDTO
                    {
                        Id = i.Id,
                        InvoiceNumber = i.InvoiceNumber,
                        PartnerId = i.PartnerId,
                        PartnerName = i.Partner.Name,
                        JournalId = i.JournalId,
                        JournalName = i.Journal.Name,
                        InvoiceDate = i.InvoiceDate,
                        DueDate = i.DueDate,
                        Type = i.Type,
                        Status = i.Status,
                        SubTotal = i.SubTotal,
                        VATAmount = i.VATAmount,
                        TotalAmount = i.TotalAmount,
                        PaidAmount = i.PaidAmount,
                        RemainingAmount = i.RemainingAmount,
                        Notes = i.Notes,
                        Reference = i.Reference,
                        PostedDate = i.PostedDate,
                        PaidDate = i.PaidDate,
                        CreatedAt = i.CreatedAt,
                        UpdatedAt = i.UpdatedAt ?? DateTime.Now
                    })
                    .ToListAsync();

                return invoices;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoices");
                throw;
            }
        }

        public async Task<InvoiceDTO?> GetInvoiceByIdAsync(int id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Partner)
                    .Include(i => i.Journal)
                    .Include(i => i.Lines)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (invoice == null) return null;

                return new InvoiceDTO
                {
                    Id = invoice.Id,
                    InvoiceNumber = invoice.InvoiceNumber,
                    PartnerId = invoice.PartnerId,
                    PartnerName = invoice.Partner.Name,
                    JournalId = invoice.JournalId,
                    JournalName = invoice.Journal.Name,
                    InvoiceDate = invoice.InvoiceDate,
                    DueDate = invoice.DueDate,
                    Type = invoice.Type,
                    Status = invoice.Status,
                    SubTotal = invoice.SubTotal,
                    VATAmount = invoice.VATAmount,
                    TotalAmount = invoice.TotalAmount,
                    PaidAmount = invoice.PaidAmount,
                    RemainingAmount = invoice.RemainingAmount,
                    Notes = invoice.Notes,
                    Reference = invoice.Reference,
                    PostedDate = invoice.PostedDate,
                    PaidDate = invoice.PaidDate,
                    Lines = invoice.Lines.Select(l => new InvoiceLineDTO
                    {
                        Id = l.Id,
                        Description = l.Description,
                        ProductCode = l.ProductCode,
                        Quantity = l.Quantity,
                        UnitPrice = l.UnitPrice,
                        Discount = l.Discount,
                        DiscountAmount = l.DiscountAmount,
                        LineTotal = l.LineTotal,
                        VATRate = l.VATRate,
                        VATAmount = l.VATAmount,
                        LineTotalWithVAT = l.LineTotalWithVAT,
                        Unit = l.Unit,
                        AccountCode = l.AccountCode,
                        Notes = l.Notes
                    }).ToList(),
                    CreatedAt = invoice.CreatedAt,
                    UpdatedAt = invoice.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoice by id {InvoiceId}", id);
                throw;
            }
        }

        public async Task<InvoiceDTO> CreateInvoiceAsync(CreateInvoiceDTO createDTO)
        {
            try
            {
                var invoice = new Invoice
                {
                    InvoiceNumber = createDTO.InvoiceNumber,
                    PartnerId = createDTO.PartnerId,
                    JournalId = createDTO.JournalId,
                    InvoiceDate = createDTO.InvoiceDate,
                    DueDate = createDTO.DueDate,
                    Type = createDTO.Type,
                    Notes = createDTO.Notes,
                    Reference = createDTO.Reference
                };

                // Add invoice lines
                foreach (var lineDTO in createDTO.Lines)
                {
                    var line = new InvoiceLine
                    {
                        Description = lineDTO.Description,
                        ProductCode = lineDTO.ProductCode,
                        Quantity = lineDTO.Quantity,
                        UnitPrice = lineDTO.UnitPrice,
                        Discount = lineDTO.Discount,
                        VATRate = lineDTO.VATRate,
                        Unit = lineDTO.Unit,
                        AccountCode = lineDTO.AccountCode,
                        Notes = lineDTO.Notes
                    };

                    // Calculate line totals
                    line.DiscountAmount = line.UnitPrice * line.Quantity * (line.Discount / 100);
                    line.LineTotal = (line.UnitPrice * line.Quantity) - line.DiscountAmount;
                    line.VATAmount = line.LineTotal * (line.VATRate / 100);
                    line.LineTotalWithVAT = line.LineTotal + line.VATAmount;

                    invoice.Lines.Add(line);
                }

                // Calculate invoice totals
                invoice.SubTotal = invoice.Lines.Sum(l => l.LineTotal);
                invoice.VATAmount = invoice.Lines.Sum(l => l.VATAmount);
                invoice.TotalAmount = invoice.SubTotal + invoice.VATAmount;
                invoice.RemainingAmount = invoice.TotalAmount;

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                return await GetInvoiceByIdAsync(invoice.Id) ?? throw new InvalidOperationException("Failed to retrieve created invoice");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating invoice");
                throw;
            }
        }

        public async Task<bool> ValidateInvoiceAsync(int id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Partner)
                    .Include(i => i.Journal)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (invoice == null) return false;

                if (invoice.Status != InvoiceStatus.Draft)
                    return false;

                // Update invoice status
                invoice.Status = InvoiceStatus.Validated;
                invoice.PostedDate = DateTime.Now;
                invoice.UpdatedAt = DateTime.Now;

                // Create journal entries
                await CreateInvoiceJournalEntriesAsync(invoice);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating invoice {InvoiceId}", id);
                throw;
            }
        }

        private async Task CreateInvoiceJournalEntriesAsync(Invoice invoice)
        {
            var journal = await _context.Journals.FindAsync(invoice.JournalId);
            if (journal == null) return;

            var entries = new List<JournalEntry>();

            if (invoice.Type == InvoiceType.Sales)
            {
                // Debit: Client account (Accounts Receivable)
                entries.Add(new JournalEntry
                {
                    Reference = $"INV-{invoice.InvoiceNumber}",
                    JournalId = invoice.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Receivable),
                    PartnerId = invoice.PartnerId,
                    InvoiceId = invoice.Id,
                    EntryDate = invoice.InvoiceDate,
                    Type = EntryType.Debit,
                    Debit = invoice.TotalAmount,
                    Description = $"Facture client {invoice.InvoiceNumber}",
                    DocumentReference = invoice.InvoiceNumber
                });

                // Credit: Sales account
                entries.Add(new JournalEntry
                {
                    Reference = $"INV-{invoice.InvoiceNumber}",
                    JournalId = invoice.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Revenue),
                    PartnerId = invoice.PartnerId,
                    InvoiceId = invoice.Id,
                    EntryDate = invoice.InvoiceDate,
                    Type = EntryType.Credit,
                    Credit = invoice.SubTotal,
                    Description = $"Vente {invoice.InvoiceNumber}",
                    DocumentReference = invoice.InvoiceNumber
                });

                // Credit: VAT Collected account
                if (invoice.VATAmount > 0)
                {
                    entries.Add(new JournalEntry
                    {
                        Reference = $"INV-{invoice.InvoiceNumber}",
                        JournalId = invoice.JournalId,
                        AccountId = await GetAccountIdByTypeAsync(AccountType.VAT),
                        PartnerId = invoice.PartnerId,
                        InvoiceId = invoice.Id,
                        EntryDate = invoice.InvoiceDate,
                        Type = EntryType.Credit,
                        Credit = invoice.VATAmount,
                        Description = $"TVA collectée {invoice.InvoiceNumber}",
                        DocumentReference = invoice.InvoiceNumber
                    });
                }
            }
            else if (invoice.Type == InvoiceType.Purchase)
            {
                // Debit: Purchase account
                entries.Add(new JournalEntry
                {
                    Reference = $"INV-{invoice.InvoiceNumber}",
                    JournalId = invoice.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Expense),
                    PartnerId = invoice.PartnerId,
                    InvoiceId = invoice.Id,
                    EntryDate = invoice.InvoiceDate,
                    Type = EntryType.Debit,
                    Debit = invoice.SubTotal,
                    Description = $"Achat {invoice.InvoiceNumber}",
                    DocumentReference = invoice.InvoiceNumber
                });

                // Debit: VAT Deductible account
                if (invoice.VATAmount > 0)
                {
                    entries.Add(new JournalEntry
                    {
                        Reference = $"INV-{invoice.InvoiceNumber}",
                        JournalId = invoice.JournalId,
                        AccountId = await GetAccountIdByTypeAsync(AccountType.VAT),
                        PartnerId = invoice.PartnerId,
                        InvoiceId = invoice.Id,
                        EntryDate = invoice.InvoiceDate,
                        Type = EntryType.Debit,
                        Debit = invoice.VATAmount,
                        Description = $"TVA déductible {invoice.InvoiceNumber}",
                        DocumentReference = invoice.InvoiceNumber
                    });
                }

                // Credit: Supplier account (Accounts Payable)
                entries.Add(new JournalEntry
                {
                    Reference = $"INV-{invoice.InvoiceNumber}",
                    JournalId = invoice.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Payable),
                    PartnerId = invoice.PartnerId,
                    InvoiceId = invoice.Id,
                    EntryDate = invoice.InvoiceDate,
                    Type = EntryType.Credit,
                    Credit = invoice.TotalAmount,
                    Description = $"Facture fournisseur {invoice.InvoiceNumber}",
                    DocumentReference = invoice.InvoiceNumber
                });
            }

            // Mark entries as posted
            foreach (var entry in entries)
            {
                entry.IsPosted = true;
                entry.PostedDate = DateTime.Now;
                entry.CreatedBy = "System";
            }

            _context.JournalEntries.AddRange(entries);
        }

        private async Task<int> GetAccountIdByTypeAsync(AccountType accountType)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Type == accountType && a.IsActive);
            
            if (account == null)
            {
                // Create default account if not exists
                account = new Account
                {
                    Code = accountType.ToString().ToUpper(),
                    Name = accountType.ToString(),
                    Type = accountType,
                    IsActive = true
                };
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();
            }

            return account.Id;
        }
        #endregion

        #region Payments
        public async Task<List<PaymentDTO>> GetPaymentsAsync(FinancialSearchDTO searchDTO)
        {
            try
            {
                var query = _context.Payments
                    .Include(p => p.Partner)
                    .Include(p => p.Journal)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchDTO.SearchTerm))
                {
                    query = query.Where(p => p.PaymentNumber.Contains(searchDTO.SearchTerm) ||
                                           p.Partner.Name.Contains(searchDTO.SearchTerm));
                }

                if (searchDTO.PaymentType.HasValue)
                {
                    query = query.Where(p => p.Type == searchDTO.PaymentType.Value);
                }

                if (searchDTO.PaymentStatus.HasValue)
                {
                    query = query.Where(p => p.Status == searchDTO.PaymentStatus.Value);
                }

                if (searchDTO.PartnerId.HasValue)
                {
                    query = query.Where(p => p.PartnerId == searchDTO.PartnerId.Value);
                }

                if (searchDTO.DateFrom.HasValue)
                {
                    query = query.Where(p => p.PaymentDate >= searchDTO.DateFrom.Value);
                }

                if (searchDTO.DateTo.HasValue)
                {
                    query = query.Where(p => p.PaymentDate <= searchDTO.DateTo.Value);
                }

                var payments = await query
                    .OrderByDescending(p => p.PaymentDate)
                    .Select(p => new PaymentDTO
                    {
                        Id = p.Id,
                        PaymentNumber = p.PaymentNumber,
                        PartnerId = p.PartnerId,
                        PartnerName = p.Partner.Name,
                        JournalId = p.JournalId,
                        JournalName = p.Journal.Name,
                        PaymentDate = p.PaymentDate,
                        Type = p.Type,
                        Status = p.Status,
                        Amount = p.Amount,
                        Method = (App.Models.Financial.PaymentMethod)p.Method,
                        BankReference = p.BankReference,
                        CheckNumber = p.CheckNumber,
                        Notes = p.Notes,
                        PostedDate = p.PostedDate,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt ?? DateTime.Now
                    })
                    .ToListAsync();

                return payments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payments");
                throw;
            }
        }

        public async Task<PaymentDTO?> GetPaymentByIdAsync(int id)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Partner)
                    .Include(p => p.Journal)
                    .Include(p => p.PaymentTranches)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (payment == null) return null;

                return new PaymentDTO
                {
                    Id = payment.Id,
                    PaymentNumber = payment.PaymentNumber,
                    PartnerId = payment.PartnerId,
                    PartnerName = payment.Partner.Name,
                    JournalId = payment.JournalId,
                    JournalName = payment.Journal.Name,
                    PaymentDate = payment.PaymentDate,
                    Type = payment.Type,
                    Status = payment.Status,
                    Amount = payment.Amount,
                    Method = (App.Models.Financial.PaymentMethod)payment.Method,
                    BankReference = payment.BankReference,
                    CheckNumber = payment.CheckNumber,
                    Notes = payment.Notes,
                    PostedDate = payment.PostedDate,
                    PaymentTranches = payment.PaymentTranches.Select(pt => new PaymentTrancheDTO
                    {
                        Id = pt.Id,
                        PaymentId = pt.PaymentId,
                        InvoiceId = pt.InvoiceId,
                        PaymentDate = pt.PaymentDate,
                        Amount = pt.Amount,
                        Status = pt.Status,
                        Reference = pt.Reference,
                        Notes = pt.Notes,
                        PostedDate = pt.PostedDate
                    }).ToList(),
                    CreatedAt = payment.CreatedAt,
                    UpdatedAt = payment.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment by id {PaymentId}", id);
                throw;
            }
        }

        public async Task<PaymentDTO> CreatePaymentAsync(CreatePaymentDTO createDTO)
        {
            try
            {
                var payment = new Payment
                {
                    PaymentNumber = createDTO.PaymentNumber,
                    PartnerId = createDTO.PartnerId,
                    JournalId = createDTO.JournalId,
                    PaymentDate = createDTO.PaymentDate,
                    Type = createDTO.Type,
                    Amount = createDTO.Amount,
                    Method = (App.Models.Financial.PaymentMethod)createDTO.Method,
                    BankReference = createDTO.BankReference,
                    CheckNumber = createDTO.CheckNumber,
                    Notes = createDTO.Notes
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return new PaymentDTO
                {
                    Id = payment.Id,
                    PaymentNumber = payment.PaymentNumber,
                    PartnerId = payment.PartnerId,
                    PartnerName = (await _context.Partners.FindAsync(payment.PartnerId))?.Name ?? "",
                    JournalId = payment.JournalId,
                    JournalName = (await _context.Journals.FindAsync(payment.JournalId))?.Name ?? "",
                    PaymentDate = payment.PaymentDate,
                    Type = payment.Type,
                    Status = payment.Status,
                    Amount = payment.Amount,
                    Method = (App.Models.Financial.PaymentMethod)payment.Method,
                    BankReference = payment.BankReference,
                    CheckNumber = payment.CheckNumber,
                    Notes = payment.Notes,
                    PostedDate = payment.PostedDate,
                    CreatedAt = payment.CreatedAt,
                    UpdatedAt = payment.UpdatedAt ?? DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                throw;
            }
        }

        public async Task<bool> ValidatePaymentAsync(int id)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Partner)
                    .Include(p => p.Journal)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (payment == null) return false;

                if (payment.Status != PaymentStatus.Draft)
                    return false;

                // Update payment status
                payment.Status = PaymentStatus.Validated;
                payment.PostedDate = DateTime.Now;
                payment.UpdatedAt = DateTime.Now;

                // Create journal entries
                await CreatePaymentJournalEntriesAsync(payment);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating payment {PaymentId}", id);
                throw;
            }
        }

        private async Task CreatePaymentJournalEntriesAsync(Payment payment)
        {
            var journal = await _context.Journals.FindAsync(payment.JournalId);
            if (journal == null) return;

            var entries = new List<JournalEntry>();

            if (payment.Type == PaymentType.Incoming)
            {
                // Debit: Bank/Cash account
                entries.Add(new JournalEntry
                {
                    Reference = $"PAY-{payment.PaymentNumber}",
                    JournalId = payment.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Bank),
                    PartnerId = payment.PartnerId,
                    PaymentId = payment.Id,
                    EntryDate = payment.PaymentDate,
                    Type = EntryType.Debit,
                    Debit = payment.Amount,
                    Description = $"Encaissement {payment.PaymentNumber}",
                    DocumentReference = payment.PaymentNumber
                });

                // Credit: Client account (Accounts Receivable)
                entries.Add(new JournalEntry
                {
                    Reference = $"PAY-{payment.PaymentNumber}",
                    JournalId = payment.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Receivable),
                    PartnerId = payment.PartnerId,
                    PaymentId = payment.Id,
                    EntryDate = payment.PaymentDate,
                    Type = EntryType.Credit,
                    Credit = payment.Amount,
                    Description = $"Encaissement client {payment.PaymentNumber}",
                    DocumentReference = payment.PaymentNumber
                });
            }
            else if (payment.Type == PaymentType.Outgoing)
            {
                // Debit: Supplier account (Accounts Payable)
                entries.Add(new JournalEntry
                {
                    Reference = $"PAY-{payment.PaymentNumber}",
                    JournalId = payment.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Payable),
                    PartnerId = payment.PartnerId,
                    PaymentId = payment.Id,
                    EntryDate = payment.PaymentDate,
                    Type = EntryType.Debit,
                    Debit = payment.Amount,
                    Description = $"Décaissement fournisseur {payment.PaymentNumber}",
                    DocumentReference = payment.PaymentNumber
                });

                // Credit: Bank/Cash account
                entries.Add(new JournalEntry
                {
                    Reference = $"PAY-{payment.PaymentNumber}",
                    JournalId = payment.JournalId,
                    AccountId = await GetAccountIdByTypeAsync(AccountType.Bank),
                    PartnerId = payment.PartnerId,
                    PaymentId = payment.Id,
                    EntryDate = payment.PaymentDate,
                    Type = EntryType.Credit,
                    Credit = payment.Amount,
                    Description = $"Décaissement {payment.PaymentNumber}",
                    DocumentReference = payment.PaymentNumber
                });
            }

            // Mark entries as posted
            foreach (var entry in entries)
            {
                entry.IsPosted = true;
                entry.PostedDate = DateTime.Now;
                entry.CreatedBy = "System";
            }

            _context.JournalEntries.AddRange(entries);
        }
        #endregion
    }
}
