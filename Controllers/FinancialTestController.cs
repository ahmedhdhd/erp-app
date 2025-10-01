using System.Threading.Tasks;
using App.Models;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialTestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FinancialTestController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("test")]
        [Authorize]
        public async Task<ActionResult<string>> TestFinancialModule()
        {
            try
            {
                // Test if the financial tables exist by querying them
                var transactionCount = await _context.Transactions.CountAsync();
                var categoryCount = await _context.TransactionCategories.CountAsync();
                var budgetCount = await _context.Budgets.CountAsync();
                var reportCount = await _context.FinancialReports.CountAsync();

                return Ok($"Financial module is working! Transactions: {transactionCount}, Categories: {categoryCount}, Budgets: {budgetCount}, Reports: {reportCount}");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error testing financial module: {ex.Message}");
            }
        }
    }
}