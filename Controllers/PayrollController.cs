using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
        private readonly PayrollService _payrollService;

        public PayrollController(PayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        // SituationFamiliale endpoints
        [HttpGet("situationfamiliale/{employeId}")]
        public async Task<ActionResult<ClientApiResponse<SituationFamilialeDTO>>> GetSituationFamiliale(int employeId)
        {
            var result = await _payrollService.GetSituationFamilialeByEmployeIdAsync(employeId);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost("situationfamiliale")]
        public async Task<ActionResult<ClientApiResponse<SituationFamilialeDTO>>> CreateSituationFamiliale(CreateSituationFamilialeRequest request)
        {
            var result = await _payrollService.CreateSituationFamilialeAsync(request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("situationfamiliale/{id}")]
        public async Task<ActionResult<ClientApiResponse<SituationFamilialeDTO>>> UpdateSituationFamiliale(int id, UpdateSituationFamilialeRequest request)
        {
            var result = await _payrollService.UpdateSituationFamilialeAsync(id, request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // EtatDePaie endpoints
        [HttpGet("etatdepaie")]
        public async Task<ActionResult<ClientApiResponse<EtatDePaieListResponse>>> GetAllEtatsDePaie([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var result = await _payrollService.GetAllEtatsDePaieAsync(page, pageSize);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("etatdepaie/search")]
        public async Task<ActionResult<ClientApiResponse<EtatDePaieListResponse>>> SearchEtatsDePaie([FromQuery] EtatDePaieSearchRequest request)
        {
            var result = await _payrollService.SearchEtatsDePaieAsync(request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("etatdepaie/{id}")]
        public async Task<ActionResult<ClientApiResponse<EtatDePaieDTO>>> GetEtatDePaie(int id)
        {
            var result = await _payrollService.GetEtatDePaieByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpGet("etatdepaie/employe/{employeId}")]
        public async Task<ActionResult<ClientApiResponse<List<EtatDePaieDTO>>>> GetEtatsDePaieByEmploye(int employeId)
        {
            var result = await _payrollService.GetEtatsDePaieByEmployeIdAsync(employeId);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost("etatdepaie")]
        public async Task<ActionResult<ClientApiResponse<EtatDePaieDTO>>> CreateEtatDePaie(CreateEtatDePaieRequest request)
        {
            var result = await _payrollService.CreateEtatDePaieAsync(request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("etatdepaie/{id}")]
        public async Task<ActionResult<ClientApiResponse<EtatDePaieDTO>>> UpdateEtatDePaie(int id, UpdateEtatDePaieRequest request)
        {
            var result = await _payrollService.UpdateEtatDePaieAsync(id, request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}