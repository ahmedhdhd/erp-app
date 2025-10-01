using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
	[ApiController]
	[Route("api/product/categories")]
	public class CategoryController : ControllerBase
	{
		private readonly ProductService _service;
		public CategoryController(ProductService service) { _service = service; }

		[HttpGet]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<System.Collections.Generic.List<CategoryDTO>>>> GetAll()
		{
			var result = await _service.GetCategoriesAsync();
			return Ok(result);
		}

		[HttpGet("{id}")]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<CategoryDTO>>> GetById([FromRoute] int id)
		{
			var result = await _service.GetCategoryByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<CategoryDTO>>> Create([FromBody] CreateProductCategoryRequest request)
		{
			var result = await _service.CreateCategoryAsync(request);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<CategoryDTO>>> Update([FromRoute] int id, [FromBody] UpdateProductCategoryRequest request)
		{
			var result = await _service.UpdateCategoryAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _service.DeleteCategoryAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpGet("stats")]
		[Authorize]
		public ActionResult<ProductApiResponse<System.Collections.Generic.List<CategoryStatsResponse>>> GetStats()
		{
			return Ok(new ProductApiResponse<System.Collections.Generic.List<CategoryStatsResponse>> { Success = true, Message = "OK", Data = new System.Collections.Generic.List<CategoryStatsResponse>() });
		}
	}
}