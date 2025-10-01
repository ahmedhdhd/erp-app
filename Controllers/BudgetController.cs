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
    public class BudgetController : ControllerBase
    {
        private readonly FinancialService _service;

        public BudgetController(FinancialService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<List<BudgetDTO>>>> GetAll()
        {
            var result = await _service.GetAllBudgetsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<BudgetDTO>>> GetById([FromRoute] int id)
        {
            var result = await _service.GetBudgetByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<BudgetDTO>>> Create([FromBody] CreateBudgetRequest request)
        {
            var result = await _service.CreateBudgetAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<BudgetDTO>>> Update([FromRoute] int id, [FromBody] UpdateBudgetRequest request)
        {
            request.Id = id;
            var result = await _service.UpdateBudgetAsync(request);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<bool>>> Delete([FromRoute] int id)
        {
            var result = await _service.DeleteBudgetAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}