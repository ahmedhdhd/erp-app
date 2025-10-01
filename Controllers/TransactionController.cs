using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly FinancialService _service;

        public TransactionController(FinancialService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<TransactionDTO>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var result = await _service.GetAllTransactionsAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<TransactionDTO>>> GetById([FromRoute] int id)
        {
            var result = await _service.GetTransactionByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<TransactionDTO>>> Create([FromBody] CreateTransactionRequest request)
        {
            var result = await _service.CreateTransactionAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<TransactionDTO>>> Update([FromRoute] int id, [FromBody] UpdateTransactionRequest request)
        {
            request.Id = id;
            var result = await _service.UpdateTransactionAsync(request);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<bool>>> Delete([FromRoute] int id)
        {
            var result = await _service.DeleteTransactionAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}