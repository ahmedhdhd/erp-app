using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Models;
using App.Models.DTOs;
using App.Models.Financial;
using Microsoft.EntityFrameworkCore;

namespace App.Services
{
    public class FinancialService
    {
        private readonly ApplicationDbContext _context;

        public FinancialService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Transaction methods
        public async Task<FinancialApiResponse<List<TransactionDTO>>> GetAllTransactionsAsync(int page, int pageSize)
        {
            try
            {
                var transactions = await _context.Transactions
                    .Include(t => t.Client)
                    .Include(t => t.Fournisseur)
                    .Include(t => t.Employe)
                    .Include(t => t.Category)
                    .OrderByDescending(t => t.DateTransaction)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var totalCount = await _context.Transactions.CountAsync();
                var dtos = transactions.Select(MapToTransactionDTO).ToList();

                var result = new FinancialApiResponse<List<TransactionDTO>>
                {
                    Success = true,
                    Message = "Transactions récupérées avec succès",
                    Data = dtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    HasNextPage = page * pageSize < totalCount,
                    HasPreviousPage = page > 1
                };
                
                return result;
            }
            catch (Exception ex)
            {
                return Failure<List<TransactionDTO>>($"Erreur lors de la récupération des transactions: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<TransactionDTO>> GetTransactionByIdAsync(int id)
        {
            try
            {
                var transaction = await _context.Transactions
                    .Include(t => t.Client)
                    .Include(t => t.Fournisseur)
                    .Include(t => t.Employe)
                    .Include(t => t.Category)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (transaction == null)
                    return Failure<TransactionDTO>("Transaction introuvable");

                return Success(MapToTransactionDTO(transaction));
            }
            catch (Exception ex)
            {
                return Failure<TransactionDTO>($"Erreur lors de la récupération de la transaction: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<TransactionDTO>> CreateTransactionAsync(CreateTransactionRequest request)
        {
            try
            {
                var transaction = new Transaction
                {
                    Type = request.Type,
                    Montant = request.Montant,
                    Description = request.Description,
                    DateTransaction = request.DateTransaction,
                    ClientId = request.ClientId,
                    FournisseurId = request.FournisseurId,
                    EmployeId = request.EmployeId,
                    CategoryId = request.CategoryId,
                    Statut = request.Statut,
                    MethodePaiement = request.MethodePaiement,
                    Reference = request.Reference,
                    Notes = request.Notes,
                    DateCreation = DateTime.Now,
                    DateModification = DateTime.Now
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                // Reload with relationships
                var createdTransaction = await _context.Transactions
                    .Include(t => t.Client)
                    .Include(t => t.Fournisseur)
                    .Include(t => t.Employe)
                    .Include(t => t.Category)
                    .FirstAsync(t => t.Id == transaction.Id);

                return Success(MapToTransactionDTO(createdTransaction));
            }
            catch (Exception ex)
            {
                return Failure<TransactionDTO>($"Erreur lors de la création de la transaction: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<TransactionDTO>> UpdateTransactionAsync(UpdateTransactionRequest request)
        {
            try
            {
                var existing = await _context.Transactions.FindAsync(request.Id);
                if (existing == null)
                    return Failure<TransactionDTO>("Transaction introuvable");

                existing.Type = request.Type;
                existing.Montant = request.Montant;
                existing.Description = request.Description;
                existing.DateTransaction = request.DateTransaction;
                existing.ClientId = request.ClientId;
                existing.FournisseurId = request.FournisseurId;
                existing.EmployeId = request.EmployeId;
                existing.CategoryId = request.CategoryId;
                existing.Statut = request.Statut;
                existing.MethodePaiement = request.MethodePaiement;
                existing.Reference = request.Reference;
                existing.Notes = request.Notes;
                existing.DateModification = DateTime.Now;

                await _context.SaveChangesAsync();

                // Reload with relationships
                var updatedTransaction = await _context.Transactions
                    .Include(t => t.Client)
                    .Include(t => t.Fournisseur)
                    .Include(t => t.Employe)
                    .Include(t => t.Category)
                    .FirstAsync(t => t.Id == existing.Id);

                return Success(MapToTransactionDTO(updatedTransaction));
            }
            catch (Exception ex)
            {
                return Failure<TransactionDTO>($"Erreur lors de la mise à jour de la transaction: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<bool>> DeleteTransactionAsync(int id)
        {
            try
            {
                var transaction = await _context.Transactions.FindAsync(id);
                if (transaction == null)
                    return Failure<bool>("Transaction introuvable");

                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return Success(true);
            }
            catch (Exception ex)
            {
                return Failure<bool>($"Erreur lors de la suppression de la transaction: {ex.Message}");
            }
        }

        // Category methods
        public async Task<FinancialApiResponse<List<TransactionCategoryDTO>>> GetAllCategoriesAsync()
        {
            try
            {
                var categories = await _context.TransactionCategories
                    .Include(c => c.ParentCategory)
                    .ToListAsync();

                var dtos = categories.Select(MapToCategoryDTO).ToList();
                return Success(dtos);
            }
            catch (Exception ex)
            {
                return Failure<List<TransactionCategoryDTO>>($"Erreur lors de la récupération des catégories: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<TransactionCategoryDTO>> GetCategoryByIdAsync(int id)
        {
            try
            {
                var category = await _context.TransactionCategories
                    .Include(c => c.ParentCategory)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return Failure<TransactionCategoryDTO>("Catégorie introuvable");

                return Success(MapToCategoryDTO(category));
            }
            catch (Exception ex)
            {
                return Failure<TransactionCategoryDTO>($"Erreur lors de la récupération de la catégorie: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<TransactionCategoryDTO>> CreateCategoryAsync(CreateCategoryRequest request)
        {
            try
            {
                var category = new TransactionCategory
                {
                    Nom = request.Nom,
                    Description = request.Description,
                    Type = request.Type,
                    ParentCategoryId = request.ParentCategoryId,
                    DateCreation = DateTime.Now,
                    DateModification = DateTime.Now
                };

                _context.TransactionCategories.Add(category);
                await _context.SaveChangesAsync();

                // Reload with relationships
                var createdCategory = await _context.TransactionCategories
                    .Include(c => c.ParentCategory)
                    .FirstAsync(c => c.Id == category.Id);

                return Success(MapToCategoryDTO(createdCategory));
            }
            catch (Exception ex)
            {
                return Failure<TransactionCategoryDTO>($"Erreur lors de la création de la catégorie: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<TransactionCategoryDTO>> UpdateCategoryAsync(UpdateCategoryRequest request)
        {
            try
            {
                var existing = await _context.TransactionCategories.FindAsync(request.Id);
                if (existing == null)
                    return Failure<TransactionCategoryDTO>("Catégorie introuvable");

                existing.Nom = request.Nom;
                existing.Description = request.Description;
                existing.Type = request.Type;
                existing.ParentCategoryId = request.ParentCategoryId;
                existing.DateModification = DateTime.Now;

                await _context.SaveChangesAsync();

                // Reload with relationships
                var updatedCategory = await _context.TransactionCategories
                    .Include(c => c.ParentCategory)
                    .FirstAsync(c => c.Id == existing.Id);

                return Success(MapToCategoryDTO(updatedCategory));
            }
            catch (Exception ex)
            {
                return Failure<TransactionCategoryDTO>($"Erreur lors de la mise à jour de la catégorie: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<bool>> DeleteCategoryAsync(int id)
        {
            try
            {
                var category = await _context.TransactionCategories.FindAsync(id);
                if (category == null)
                    return Failure<bool>("Catégorie introuvable");

                _context.TransactionCategories.Remove(category);
                await _context.SaveChangesAsync();

                return Success(true);
            }
            catch (Exception ex)
            {
                return Failure<bool>($"Erreur lors de la suppression de la catégorie: {ex.Message}");
            }
        }

        // Budget methods
        public async Task<FinancialApiResponse<List<BudgetDTO>>> GetAllBudgetsAsync()
        {
            try
            {
                var budgets = await _context.Budgets
                    .Include(b => b.Category)
                    .OrderByDescending(b => b.DateDebut)
                    .ToListAsync();

                var dtos = budgets.Select(MapToBudgetDTO).ToList();
                return Success(dtos);
            }
            catch (Exception ex)
            {
                return Failure<List<BudgetDTO>>($"Erreur lors de la récupération des budgets: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<BudgetDTO>> GetBudgetByIdAsync(int id)
        {
            try
            {
                var budget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (budget == null)
                    return Failure<BudgetDTO>("Budget introuvable");

                return Success(MapToBudgetDTO(budget));
            }
            catch (Exception ex)
            {
                return Failure<BudgetDTO>($"Erreur lors de la récupération du budget: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<BudgetDTO>> CreateBudgetAsync(CreateBudgetRequest request)
        {
            try
            {
                var budget = new Budget
                {
                    Nom = request.Nom,
                    Description = request.Description,
                    CategoryId = request.CategoryId,
                    MontantPrevu = request.MontantPrevu,
                    MontantDepense = request.MontantDepense,
                    DateDebut = request.DateDebut,
                    DateFin = request.DateFin,
                    Statut = request.Statut,
                    Notes = request.Notes,
                    DateCreation = DateTime.Now,
                    DateModification = DateTime.Now
                };

                _context.Budgets.Add(budget);
                await _context.SaveChangesAsync();

                // Reload with relationships
                var createdBudget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstAsync(b => b.Id == budget.Id);

                return Success(MapToBudgetDTO(createdBudget));
            }
            catch (Exception ex)
            {
                return Failure<BudgetDTO>($"Erreur lors de la création du budget: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<BudgetDTO>> UpdateBudgetAsync(UpdateBudgetRequest request)
        {
            try
            {
                var existing = await _context.Budgets.FindAsync(request.Id);
                if (existing == null)
                    return Failure<BudgetDTO>("Budget introuvable");

                existing.Nom = request.Nom;
                existing.Description = request.Description;
                existing.CategoryId = request.CategoryId;
                existing.MontantPrevu = request.MontantPrevu;
                existing.MontantDepense = request.MontantDepense;
                existing.DateDebut = request.DateDebut;
                existing.DateFin = request.DateFin;
                existing.Statut = request.Statut;
                existing.Notes = request.Notes;
                existing.DateModification = DateTime.Now;

                await _context.SaveChangesAsync();

                // Reload with relationships
                var updatedBudget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstAsync(b => b.Id == existing.Id);

                return Success(MapToBudgetDTO(updatedBudget));
            }
            catch (Exception ex)
            {
                return Failure<BudgetDTO>($"Erreur lors de la mise à jour du budget: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<bool>> DeleteBudgetAsync(int id)
        {
            try
            {
                var budget = await _context.Budgets.FindAsync(id);
                if (budget == null)
                    return Failure<bool>("Budget introuvable");

                _context.Budgets.Remove(budget);
                await _context.SaveChangesAsync();

                return Success(true);
            }
            catch (Exception ex)
            {
                return Failure<bool>($"Erreur lors de la suppression du budget: {ex.Message}");
            }
        }

        // Report methods
        public async Task<FinancialApiResponse<List<FinancialReportDTO>>> GetAllReportsAsync()
        {
            try
            {
                var reports = await _context.FinancialReports
                    .OrderByDescending(r => r.DateGeneration)
                    .ToListAsync();

                var dtos = reports.Select(MapToReportDTO).ToList();
                return Success(dtos);
            }
            catch (Exception ex)
            {
                return Failure<List<FinancialReportDTO>>($"Erreur lors de la récupération des rapports: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<FinancialReportDTO>> GetReportByIdAsync(int id)
        {
            try
            {
                var report = await _context.FinancialReports.FindAsync(id);
                if (report == null)
                    return Failure<FinancialReportDTO>("Rapport introuvable");

                return Success(MapToReportDTO(report));
            }
            catch (Exception ex)
            {
                return Failure<FinancialReportDTO>($"Erreur lors de la récupération du rapport: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<FinancialReportDTO>> CreateReportAsync(CreateFinancialReportRequest request)
        {
            try
            {
                var report = new FinancialReport
                {
                    Titre = request.Titre,
                    Description = request.Description,
                    DateDebut = request.DateDebut,
                    DateFin = request.DateFin,
                    DateGeneration = DateTime.Now,
                    RevenusTotal = request.RevenusTotal,
                    DepensesTotal = request.DepensesTotal,
                    Profit = request.Profit,
                    TauxCroissance = request.TauxCroissance,
                    Contenu = request.Contenu,
                    Type = request.Type,
                    Statut = request.Statut,
                    DateCreation = DateTime.Now,
                    DateModification = DateTime.Now
                };

                _context.FinancialReports.Add(report);
                await _context.SaveChangesAsync();

                return Success(MapToReportDTO(report));
            }
            catch (Exception ex)
            {
                return Failure<FinancialReportDTO>($"Erreur lors de la création du rapport: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<FinancialReportDTO>> UpdateReportAsync(UpdateFinancialReportRequest request)
        {
            try
            {
                var existing = await _context.FinancialReports.FindAsync(request.Id);
                if (existing == null)
                    return Failure<FinancialReportDTO>("Rapport introuvable");

                existing.Titre = request.Titre;
                existing.Description = request.Description;
                existing.DateDebut = request.DateDebut;
                existing.DateFin = request.DateFin;
                existing.RevenusTotal = request.RevenusTotal;
                existing.DepensesTotal = request.DepensesTotal;
                existing.Profit = request.Profit;
                existing.TauxCroissance = request.TauxCroissance;
                existing.Contenu = request.Contenu;
                existing.Type = request.Type;
                existing.Statut = request.Statut;
                existing.DateModification = DateTime.Now;

                await _context.SaveChangesAsync();

                return Success(MapToReportDTO(existing));
            }
            catch (Exception ex)
            {
                return Failure<FinancialReportDTO>($"Erreur lors de la mise à jour du rapport: {ex.Message}");
            }
        }

        public async Task<FinancialApiResponse<bool>> DeleteReportAsync(int id)
        {
            try
            {
                var report = await _context.FinancialReports.FindAsync(id);
                if (report == null)
                    return Failure<bool>("Rapport introuvable");

                _context.FinancialReports.Remove(report);
                await _context.SaveChangesAsync();

                return Success(true);
            }
            catch (Exception ex)
            {
                return Failure<bool>($"Erreur lors de la suppression du rapport: {ex.Message}");
            }
        }

        // Helper methods for mapping
        private TransactionDTO MapToTransactionDTO(Transaction transaction)
        {
            return new TransactionDTO
            {
                Id = transaction.Id,
                Type = transaction.Type,
                Montant = transaction.Montant,
                Description = transaction.Description,
                DateTransaction = transaction.DateTransaction,
                ClientId = transaction.ClientId,
                ClientNom = transaction.Client?.RaisonSociale ?? transaction.Client?.Nom ?? null,
                FournisseurId = transaction.FournisseurId,
                FournisseurNom = transaction.Fournisseur?.RaisonSociale ?? null,
                EmployeId = transaction.EmployeId,
                EmployeNom = transaction.Employe?.Nom ?? null,
                CategoryId = transaction.CategoryId,
                CategoryNom = transaction.Category?.Nom ?? null,
                Statut = transaction.Statut,
                MethodePaiement = transaction.MethodePaiement,
                Reference = transaction.Reference,
                Notes = transaction.Notes,
                DateCreation = transaction.DateCreation,
                DateModification = transaction.DateModification ?? transaction.DateCreation
            };
        }

        private TransactionCategoryDTO MapToCategoryDTO(TransactionCategory category)
        {
            return new TransactionCategoryDTO
            {
                Id = category.Id,
                Nom = category.Nom,
                Description = category.Description,
                Type = category.Type,
                ParentCategoryId = category.ParentCategoryId,
                ParentCategoryNom = category.ParentCategory?.Nom ?? null,
                DateCreation = category.DateCreation,
                DateModification = category.DateModification ?? category.DateCreation
            };
        }

        private BudgetDTO MapToBudgetDTO(Budget budget)
        {
            return new BudgetDTO
            {
                Id = budget.Id,
                Nom = budget.Nom,
                Description = budget.Description,
                CategoryId = budget.CategoryId,
                CategoryNom = budget.Category?.Nom ?? null,
                MontantPrevu = budget.MontantPrevu,
                MontantDepense = budget.MontantDepense,
                DateDebut = budget.DateDebut,
                DateFin = budget.DateFin,
                Statut = budget.Statut,
                Notes = budget.Notes,
                DateCreation = budget.DateCreation,
                DateModification = budget.DateModification ?? budget.DateCreation
            };
        }

        private FinancialReportDTO MapToReportDTO(FinancialReport report)
        {
            return new FinancialReportDTO
            {
                Id = report.Id,
                Titre = report.Titre,
                Description = report.Description,
                DateDebut = report.DateDebut,
                DateFin = report.DateFin,
                DateGeneration = report.DateGeneration,
                RevenusTotal = report.RevenusTotal,
                DepensesTotal = report.DepensesTotal,
                Profit = report.Profit,
                TauxCroissance = report.TauxCroissance,
                Contenu = report.Contenu,
                Type = report.Type,
                Statut = report.Statut,
                DateCreation = report.DateCreation,
                DateModification = report.DateModification ?? report.DateCreation
            };
        }

        private FinancialApiResponse<T> Success<T>(T data)
        {
            return new FinancialApiResponse<T>
            {
                Success = true,
                Message = "OK",
                Data = data,
                Timestamp = DateTime.UtcNow
            };
        }

        private FinancialApiResponse<T> Failure<T>(string message)
        {
            return new FinancialApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default(T),
                Timestamp = DateTime.UtcNow
            };
        }
    }
}