using System.Collections.Generic;
using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialReportController : ControllerBase
    {
        private readonly FinancialService _service;

        public FinancialReportController(FinancialService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<List<FinancialReportDTO>>>> GetAll()
        {
            var result = await _service.GetAllReportsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<FinancialReportDTO>>> GetById([FromRoute] int id)
        {
            var result = await _service.GetReportByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<FinancialReportDTO>>> Create([FromBody] CreateFinancialReportRequest request)
        {
            var result = await _service.CreateReportAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<FinancialReportDTO>>> Update([FromRoute] int id, [FromBody] UpdateFinancialReportRequest request)
        {
            request.Id = id;
            var result = await _service.UpdateReportAsync(request);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<bool>>> Delete([FromRoute] int id)
        {
            var result = await _service.DeleteReportAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}