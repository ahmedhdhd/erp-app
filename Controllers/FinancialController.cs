using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using App.Services;
using App.Models.DTOs;
using App.Models;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialController : ControllerBase
    {
        private readonly FinancialService _financialService;

        public FinancialController(FinancialService financialService)
        {
            _financialService = financialService;
        }

        // Account endpoints
        [HttpGet("accounts")]
        public async Task<ActionResult<List<AccountDTO>>> GetAllAccounts()
        {
            try
            {
                var accounts = await _financialService.GetAllAccountsAsync();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("accounts/{id}")]
        public async Task<ActionResult<AccountDTO>> GetAccount(int id)
        {
            try
            {
                var account = await _financialService.GetAccountByIdAsync(id);
                if (account == null)
                    return NotFound(new { message = "Account not found" });

                return Ok(account);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("accounts")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult<AccountDTO>> CreateAccount([FromBody] CreateAccountDTO account)
        {
            try
            {
                var createdAccount = await _financialService.CreateAccountAsync(account);
                return CreatedAtAction(nameof(GetAccount), new { id = createdAccount.Id }, createdAccount);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("accounts/{id}")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult<AccountDTO>> UpdateAccount(int id, [FromBody] UpdateAccountDTO account)
        {
            try
            {
                var updatedAccount = await _financialService.UpdateAccountAsync(id, account);
                return Ok(updatedAccount);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("accounts/{id}")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _financialService.DeleteAccountAsync(id);
                if (!result)
                    return NotFound(new { message = "Account not found" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("accounts/type/{type}")]
        public async Task<ActionResult<List<AccountDTO>>> GetAccountsByType(string type)
        {
            try
            {
                var accounts = await _financialService.GetAccountsByTypeAsync(type);
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("accounts/{parentId}/children")]
        public async Task<ActionResult<List<AccountDTO>>> GetChildAccounts(int parentId)
        {
            try
            {
                var accounts = await _financialService.GetChildAccountsAsync(parentId);
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Journal Entry endpoints
        [HttpGet("journal-entries")]
        public async Task<ActionResult<List<JournalEntryDTO>>> GetAllJournalEntries()
        {
            try
            {
                var journalEntries = await _financialService.GetAllJournalEntriesAsync();
                return Ok(journalEntries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("journal-entries/{id}")]
        public async Task<ActionResult<JournalEntryDTO>> GetJournalEntry(int id)
        {
            try
            {
                var journalEntry = await _financialService.GetJournalEntryByIdAsync(id);
                if (journalEntry == null)
                    return NotFound(new { message = "Journal entry not found" });

                return Ok(journalEntry);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("journal-entries")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult<JournalEntryDTO>> CreateJournalEntry([FromBody] CreateJournalEntryDTO journalEntry)
        {
            try
            {
                var createdEntry = await _financialService.CreateJournalEntryAsync(journalEntry);
                return CreatedAtAction(nameof(GetJournalEntry), new { id = createdEntry.Id }, createdEntry);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("journal-entries/{id}")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult<JournalEntryDTO>> UpdateJournalEntry(int id, [FromBody] UpdateJournalEntryDTO journalEntry)
        {
            try
            {
                var updatedEntry = await _financialService.UpdateJournalEntryAsync(id, journalEntry);
                return Ok(updatedEntry);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("journal-entries/{id}")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult> DeleteJournalEntry(int id)
        {
            try
            {
                var result = await _financialService.DeleteJournalEntryAsync(id);
                if (!result)
                    return NotFound(new { message = "Journal entry not found" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("journal-entries/{id}/post")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult> PostJournalEntry(int id)
        {
            try
            {
                // Get current user ID from JWT token
                var userIdClaim = User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                var result = await _financialService.PostJournalEntryAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Journal entry not found" });

                return Ok(new { message = "Journal entry posted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("journal-entries/{id}/reverse")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult> ReverseJournalEntry(int id)
        {
            try
            {
                // Get current user ID from JWT token
                var userIdClaim = User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                var result = await _financialService.ReverseJournalEntryAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Journal entry not found" });

                return Ok(new { message = "Journal entry reversed successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("journal-entries/date-range")]
        public async Task<ActionResult<List<JournalEntryDTO>>> GetJournalEntriesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var journalEntries = await _financialService.GetJournalEntriesByDateRangeAsync(startDate, endDate);
                return Ok(journalEntries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Bank Account endpoints
        [HttpGet("bank-accounts")]
        public async Task<ActionResult<List<BankAccountDTO>>> GetAllBankAccounts()
        {
            try
            {
                var bankAccounts = await _financialService.GetAllBankAccountsAsync();
                return Ok(bankAccounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("bank-accounts/{id}")]
        public async Task<ActionResult<BankAccountDTO>> GetBankAccount(int id)
        {
            try
            {
                var bankAccount = await _financialService.GetBankAccountByIdAsync(id);
                if (bankAccount == null)
                    return NotFound(new { message = "Bank account not found" });

                return Ok(bankAccount);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("bank-accounts")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult<BankAccountDTO>> CreateBankAccount([FromBody] CreateBankAccountDTO bankAccount)
        {
            try
            {
                var createdAccount = await _financialService.CreateBankAccountAsync(bankAccount);
                return CreatedAtAction(nameof(GetBankAccount), new { id = createdAccount.Id }, createdAccount);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("bank-accounts/{id}")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult<BankAccountDTO>> UpdateBankAccount(int id, [FromBody] UpdateBankAccountDTO bankAccount)
        {
            try
            {
                var updatedAccount = await _financialService.UpdateBankAccountAsync(id, bankAccount);
                return Ok(updatedAccount);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("bank-accounts/{id}")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult> DeleteBankAccount(int id)
        {
            try
            {
                var result = await _financialService.DeleteBankAccountAsync(id);
                if (!result)
                    return NotFound(new { message = "Bank account not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("bank-accounts/{id}/balance")]
        [Authorize(Roles = "Admin,Finance")]
        public async Task<ActionResult> UpdateBankAccountBalance(int id, [FromBody] decimal newBalance)
        {
            try
            {
                var result = await _financialService.UpdateBankAccountBalanceAsync(id, newBalance);
                if (!result)
                    return NotFound(new { message = "Bank account not found" });

                return Ok(new { message = "Bank account balance updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Financial Reports endpoints
        [HttpGet("reports/trial-balance")]
        public async Task<ActionResult<List<TrialBalanceDTO>>> GetTrialBalance([FromQuery] DateTime? asOfDate = null)
        {
            try
            {
                var date = asOfDate ?? DateTime.Now;
                var trialBalance = await _financialService.GetTrialBalanceAsync(date);
                return Ok(trialBalance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("reports/profit-loss")]
        public async Task<ActionResult<List<ProfitLossDTO>>> GetProfitLoss([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.Now.AddMonths(-1);
                var end = endDate ?? DateTime.Now;
                var profitLoss = await _financialService.GetProfitLossAsync(start, end);
                return Ok(profitLoss);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("reports/balance-sheet")]
        public async Task<ActionResult<List<BalanceSheetDTO>>> GetBalanceSheet([FromQuery] DateTime? asOfDate = null)
        {
            try
            {
                var date = asOfDate ?? DateTime.Now;
                var balanceSheet = await _financialService.GetBalanceSheetAsync(date);
                return Ok(balanceSheet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("accounts/{accountId}/balance")]
        public async Task<ActionResult<decimal>> GetAccountBalance(int accountId, [FromQuery] DateTime? asOfDate = null)
        {
            try
            {
                var date = asOfDate ?? DateTime.Now;
                var balance = await _financialService.GetAccountBalanceAsync(accountId, date);
                return Ok(balance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
