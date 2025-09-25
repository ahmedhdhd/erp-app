using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class FournisseurController : ControllerBase
	{
		private readonly FournisseurService _service;

		public FournisseurController(FournisseurService service)
		{
			_service = service;
		}

		[HttpGet]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<FournisseurListResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
		{
			var result = await _service.GetAllAsync(page, pageSize);
			return Ok(result);
		}

		[HttpPost("search")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<FournisseurListResponse>>> Search([FromBody] FournisseurSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			return Ok(result);
		}

		[HttpGet("{id}")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<FournisseurDTO>>> GetById([FromRoute] int id)
		{
			var result = await _service.GetByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<FournisseurDTO>>> Create([FromBody] CreateFournisseurRequest request)
		{
			var result = await _service.CreateAsync(request);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<FournisseurDTO>>> Update([FromRoute] int id, [FromBody] UpdateFournisseurRequest request)
		{
			var result = await _service.UpdateAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _service.DeleteAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("{fournisseurId}/contacts")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<ContactFournisseurDTO>>> CreateContact([FromRoute] int fournisseurId, [FromBody] CreateContactFournisseurRequest request)
		{
			var result = await _service.CreateContactAsync(fournisseurId, request);
			return Ok(result);
		}

		[HttpPut("contacts")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<ContactFournisseurDTO>>> UpdateContact([FromBody] UpdateContactFournisseurRequest request)
		{
			var result = await _service.UpdateContactAsync(request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("contacts/{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<bool>>> DeleteContact([FromRoute] int id)
		{
			var result = await _service.DeleteContactAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpGet("statistics")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<FournisseurStatsResponse>>> GetStats()
		{
			var result = await _service.GetStatsAsync();
			return Ok(result);
		}

		[HttpGet("types")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<System.Collections.Generic.List<string>>>> GetTypes()
		{
			var list = await _service.GetTypesAsync();
			return Ok(new FournisseurApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = list, Timestamp = System.DateTime.UtcNow });
		}

		[HttpGet("cities")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<System.Collections.Generic.List<string>>>> GetCities()
		{
			var list = await _service.GetVillesAsync();
			return Ok(new FournisseurApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = list, Timestamp = System.DateTime.UtcNow });
		}

		[HttpGet("payment-terms")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<System.Collections.Generic.List<string>>>> GetPaymentTerms()
		{
			var list = await _service.GetConditionsPaiementAsync();
			return Ok(new FournisseurApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = list, Timestamp = System.DateTime.UtcNow });
		}
	}
}


