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
    public class TransactionCategoryController : ControllerBase
    {
        private readonly FinancialService _service;

        public TransactionCategoryController(FinancialService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<List<TransactionCategoryDTO>>>> GetAll()
        {
            var result = await _service.GetAllCategoriesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ClientApiResponse<TransactionCategoryDTO>>> GetById([FromRoute] int id)
        {
            var result = await _service.GetCategoryByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<TransactionCategoryDTO>>> Create([FromBody] CreateCategoryRequest request)
        {
            var result = await _service.CreateCategoryAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<TransactionCategoryDTO>>> Update([FromRoute] int id, [FromBody] UpdateCategoryRequest request)
        {
            request.Id = id;
            var result = await _service.UpdateCategoryAsync(request);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<bool>>> Delete([FromRoute] int id)
        {
            var result = await _service.DeleteCategoryAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}