using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class StockController : ControllerBase
	{
		private readonly ProductService _service;
		public StockController(ProductService service) { _service = service; }

		[HttpGet("product/{productId}")]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<System.Collections.Generic.List<StockMovementDTO>>>> GetMovements([FromRoute] int productId, [FromQuery] int? variantId)
		{
			var result = await _service.GetStockMovementsAsync(productId, variantId);
			return Ok(result);
		}

		[HttpPost("adjust")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<StockMovementDTO>>> Adjust([FromBody] StockAdjustmentRequest request)
		{
			var result = await _service.CreateStockAdjustmentAsync(request.ProductId, request);
			return Ok(result);
		}
	}
}


