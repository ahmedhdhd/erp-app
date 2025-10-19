using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        #region Dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<FinancialDashboardDTO>> GetDashboard()
        {
            try
            {
                var dashboard = await _financialService.GetDashboardDataAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving dashboard data", error = ex.Message });
            }
        }
        #endregion

        #region Accounts
        [HttpGet("accounts")]
        public async Task<ActionResult<List<AccountDTO>>> GetAccounts([FromQuery] FinancialSearchDTO searchDTO)
        {
            try
            {
                var accounts = await _financialService.GetAccountsAsync(searchDTO);
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving accounts", error = ex.Message });
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
                return StatusCode(500, new { message = "Error retrieving account", error = ex.Message });
            }
        }

        [HttpPost("accounts")]
        public async Task<ActionResult<AccountDTO>> CreateAccount([FromBody] CreateAccountDTO createDTO)
        {
            try
            {
                var account = await _financialService.CreateAccountAsync(createDTO);
                return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating account", error = ex.Message });
            }
        }

        [HttpPut("accounts/{id}")]
        public async Task<ActionResult<AccountDTO>> UpdateAccount(int id, [FromBody] UpdateAccountDTO updateDTO)
        {
            try
            {
                var account = await _financialService.UpdateAccountAsync(id, updateDTO);
                return Ok(account);
            }
            catch (ArgumentException)
            {
                return NotFound(new { message = "Account not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating account", error = ex.Message });
            }
        }

        [HttpDelete("accounts/{id}")]
        public async Task<ActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _financialService.DeleteAccountAsync(id);
                if (!result)
                    return NotFound(new { message = "Account not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting account", error = ex.Message });
            }
        }
        #endregion

        #region Journals
        [HttpGet("journals")]
        public async Task<ActionResult<List<JournalDTO>>> GetJournals([FromQuery] FinancialSearchDTO searchDTO)
        {
            try
            {
                var journals = await _financialService.GetJournalsAsync(searchDTO);
                return Ok(journals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving journals", error = ex.Message });
            }
        }

        [HttpGet("journals/{id}")]
        public async Task<ActionResult<JournalDTO>> GetJournal(int id)
        {
            try
            {
                var journal = await _financialService.GetJournalByIdAsync(id);
                if (journal == null)
                    return NotFound(new { message = "Journal not found" });

                return Ok(journal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving journal", error = ex.Message });
            }
        }

        [HttpPost("journals")]
        public async Task<ActionResult<JournalDTO>> CreateJournal([FromBody] CreateJournalDTO createDTO)
        {
            try
            {
                var journal = await _financialService.CreateJournalAsync(createDTO);
                return CreatedAtAction(nameof(GetJournal), new { id = journal.Id }, journal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating journal", error = ex.Message });
            }
        }

        [HttpPut("journals/{id}")]
        public async Task<ActionResult<JournalDTO>> UpdateJournal(int id, [FromBody] UpdateJournalDTO updateDTO)
        {
            try
            {
                var journal = await _financialService.UpdateJournalAsync(id, updateDTO);
                return Ok(journal);
            }
            catch (ArgumentException)
            {
                return NotFound(new { message = "Journal not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating journal", error = ex.Message });
            }
        }
        #endregion

        #region Partners
        [HttpGet("partners")]
        public async Task<ActionResult<List<PartnerDTO>>> GetPartners([FromQuery] FinancialSearchDTO searchDTO)
        {
            try
            {
                var partners = await _financialService.GetPartnersAsync(searchDTO);
                return Ok(partners);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving partners", error = ex.Message });
            }
        }

        [HttpGet("partners/{id}")]
        public async Task<ActionResult<PartnerDTO>> GetPartner(int id)
        {
            try
            {
                var partner = await _financialService.GetPartnerByIdAsync(id);
                if (partner == null)
                    return NotFound(new { message = "Partner not found" });

                return Ok(partner);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving partner", error = ex.Message });
            }
        }

        [HttpPost("partners")]
        public async Task<ActionResult<PartnerDTO>> CreatePartner([FromBody] CreatePartnerDTO createDTO)
        {
            try
            {
                var partner = await _financialService.CreatePartnerAsync(createDTO);
                return CreatedAtAction(nameof(GetPartner), new { id = partner.Id }, partner);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating partner", error = ex.Message });
            }
        }

        [HttpPut("partners/{id}")]
        public async Task<ActionResult<PartnerDTO>> UpdatePartner(int id, [FromBody] UpdatePartnerDTO updateDTO)
        {
            try
            {
                var partner = await _financialService.UpdatePartnerAsync(id, updateDTO);
                return Ok(partner);
            }
            catch (ArgumentException)
            {
                return NotFound(new { message = "Partner not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating partner", error = ex.Message });
            }
        }
        #endregion

        #region Invoices
        [HttpGet("invoices")]
        public async Task<ActionResult<List<InvoiceDTO>>> GetInvoices([FromQuery] FinancialSearchDTO searchDTO)
        {
            try
            {
                var invoices = await _financialService.GetInvoicesAsync(searchDTO);
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving invoices", error = ex.Message });
            }
        }

        [HttpGet("invoices/{id}")]
        public async Task<ActionResult<InvoiceDTO>> GetInvoice(int id)
        {
            try
            {
                var invoice = await _financialService.GetInvoiceByIdAsync(id);
                if (invoice == null)
                    return NotFound(new { message = "Invoice not found" });

                return Ok(invoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving invoice", error = ex.Message });
            }
        }

        [HttpPost("invoices")]
        public async Task<ActionResult<InvoiceDTO>> CreateInvoice([FromBody] CreateInvoiceDTO createDTO)
        {
            try
            {
                var invoice = await _financialService.CreateInvoiceAsync(createDTO);
                return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating invoice", error = ex.Message });
            }
        }

        [HttpPost("invoices/{id}/validate")]
        public async Task<ActionResult> ValidateInvoice(int id)
        {
            try
            {
                var result = await _financialService.ValidateInvoiceAsync(id);
                if (!result)
                    return NotFound(new { message = "Invoice not found or already validated" });

                return Ok(new { message = "Invoice validated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error validating invoice", error = ex.Message });
            }
        }
        #endregion

        #region Payments
        [HttpGet("payments")]
        public async Task<ActionResult<List<PaymentDTO>>> GetPayments([FromQuery] FinancialSearchDTO searchDTO)
        {
            try
            {
                var payments = await _financialService.GetPaymentsAsync(searchDTO);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payments", error = ex.Message });
            }
        }

        [HttpGet("payments/{id}")]
        public async Task<ActionResult<PaymentDTO>> GetPayment(int id)
        {
            try
            {
                var payment = await _financialService.GetPaymentByIdAsync(id);
                if (payment == null)
                    return NotFound(new { message = "Payment not found" });

                return Ok(payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payment", error = ex.Message });
            }
        }

        [HttpPost("payments")]
        public async Task<ActionResult<PaymentDTO>> CreatePayment([FromBody] CreatePaymentDTO createDTO)
        {
            try
            {
                var payment = await _financialService.CreatePaymentAsync(createDTO);
                return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating payment", error = ex.Message });
            }
        }

        [HttpPost("payments/{id}/validate")]
        public async Task<ActionResult> ValidatePayment(int id)
        {
            try
            {
                var result = await _financialService.ValidatePaymentAsync(id);
                if (!result)
                    return NotFound(new { message = "Payment not found or already validated" });

                return Ok(new { message = "Payment validated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error validating payment", error = ex.Message });
            }
        }
        #endregion
    }
}