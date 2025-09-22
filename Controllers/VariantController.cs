using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class VariantController : ControllerBase
	{
		private readonly ProductService _service;
		public VariantController(ProductService service) { _service = service; }

		[HttpGet("product/{productId}")]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<System.Collections.Generic.List<VariantDTO>>>> GetByProduct(int productId)
		{
			var result = await _service.GetVariantsByProductAsync(productId);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<VariantDTO>>> Create([FromBody] CreateVariantRequest request)
		{
			var result = await _service.CreateVariantAsync(request);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<VariantDTO>>> Update([FromRoute] int id, [FromBody] UpdateVariantRequest request)
		{
			var result = await _service.UpdateVariantAsync(id, request);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _service.DeleteVariantAsync(id);
			return Ok(result);
		}
	}
}


