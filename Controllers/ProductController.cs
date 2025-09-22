using System.Text;
using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class ProductController : ControllerBase
	{
		private readonly ProductService _service;

		public ProductController(ProductService service)
		{
			_service = service;
		}

		[HttpGet]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<ProductListResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
		{
			var result = await _service.GetAllAsync(page, pageSize);
			return Ok(result);
		}

		[HttpGet("{id}")]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<ProductDTO>>> GetById([FromRoute] int id)
		{
			var result = await _service.GetByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<ProductDTO>>> Create([FromBody] CreateProductRequest request)
		{
			var result = await _service.CreateAsync(request);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<ProductDTO>>> Update([FromRoute] int id, [FromBody] UpdateProductRequest request)
		{
			var result = await _service.UpdateAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<ProductApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _service.DeleteAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("search")]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<ProductListResponse>>> Search([FromBody] ProductSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			return Ok(result);
		}

		[HttpPatch("{id}/status")]
		[Authorize]
		public async Task<ActionResult<ProductApiResponse<bool>>> UpdateStatus([FromRoute] int id, [FromBody] string newStatus)
		{
			var result = await _service.UpdateStatusAsync(id, newStatus);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpGet("stock/alerts")]
		[Authorize]
		public ActionResult<ProductApiResponse<System.Collections.Generic.List<ProductDTO>>> GetStockAlerts()
		{
			var result = _service.GetStockAlerts();
			return Ok(result);
		}

		[HttpGet("statuses")]
		[Authorize]
		public ActionResult<ProductApiResponse<System.Collections.Generic.List<string>>> GetStatuses()
		{
			return Ok(_service.GetStatuses());
		}

		[HttpGet("units")]
		[Authorize]
		public ActionResult<ProductApiResponse<System.Collections.Generic.List<string>>> GetUnits()
		{
			return Ok(_service.GetUnits());
		}

		[HttpPost("export/csv")]
		[Authorize]
		public async Task<IActionResult> ExportCsv([FromBody] ProductSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			if (!result.Success || result.Data == null) return BadRequest("Aucune donnée à exporter");
			var sb = new StringBuilder();
			sb.AppendLine("Id;Reference;Designation;Categorie;SousCategorie;PrixVente;StockActuel;Statut");
			foreach (var p in result.Data.Products)
			{
				sb.AppendLine($"{p.Id};{p.Reference};{p.Designation};{p.Categorie};{p.SousCategorie};{p.PrixVente};{p.StockActuel};{p.Statut}");
			}
			return File(System.Text.Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "products.csv");
		}
	}
}


