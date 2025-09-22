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
	public class ClientController : ControllerBase
	{
		private readonly ClientService _service;

		public ClientController(ClientService service)
		{
			_service = service;
		}

		[HttpGet]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<ClientListResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
		{
			var result = await _service.GetAllAsync(page, pageSize);
			return Ok(result);
		}

		[HttpPost("search")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<ClientListResponse>>> Search([FromBody] ClientSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			return Ok(result);
		}

		[HttpGet("{id}")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<ClientDTO>>> GetById([FromRoute] int id)
		{
			var result = await _service.GetByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<ClientDTO>>> Create([FromBody] CreateClientRequest request)
		{
			var result = await _service.CreateAsync(request);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<ClientDTO>>> Update([FromRoute] int id, [FromBody] UpdateClientRequest request)
		{
			var result = await _service.UpdateAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _service.DeleteAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("{clientId}/contacts")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<ContactClientDTO>>> CreateContact([FromRoute] int clientId, [FromBody] CreateContactClientRequest request)
		{
			var result = await _service.CreateContactAsync(clientId, request);
			return Ok(result);
		}

		[HttpPut("contacts")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<ContactClientDTO>>> UpdateContact([FromBody] UpdateContactClientRequest request)
		{
			var result = await _service.UpdateContactAsync(request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("contacts/{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<bool>>> DeleteContact([FromRoute] int id)
		{
			var result = await _service.DeleteContactAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpGet("statistics")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<ClientStatsResponse>>> GetStats()
		{
			var result = await _service.GetStatsAsync();
			return Ok(result);
		}

		[HttpGet("types")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<System.Collections.Generic.List<string>>>> GetTypes()
		{
			var list = await _service.GetClientTypesAsync();
			return Ok(new ClientApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = list, Timestamp = System.DateTime.UtcNow });
		}

		[HttpGet("classifications")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<System.Collections.Generic.List<string>>>> GetClassifications()
		{
			var list = await _service.GetClassificationsAsync();
			return Ok(new ClientApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = list, Timestamp = System.DateTime.UtcNow });
		}

		[HttpGet("cities")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<System.Collections.Generic.List<string>>>> GetCities()
		{
			var list = await _service.GetCitiesAsync();
			return Ok(new ClientApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = list, Timestamp = System.DateTime.UtcNow });
		}

		[HttpPost("export/csv")]
		[Authorize]
		public async Task<IActionResult> ExportToCsv([FromBody] ClientSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			if (!result.Success || result.Data == null) return BadRequest("Aucune donnée à exporter");
			var sb = new StringBuilder();
			sb.AppendLine("Id;Nom;Prenom;RaisonSociale;TypeClient;ICE;Ville;Telephone;Email;Classification;LimiteCredit;EstActif;DateCreation");
			foreach (var c in result.Data.Clients)
			{
				sb.AppendLine($"{c.Id};{c.Nom};{c.Prenom};{c.RaisonSociale};{c.TypeClient};{c.ICE};{c.Ville};{c.Telephone};{c.Email};{c.Classification};{c.LimiteCredit};{c.EstActif};{c.DateCreation:yyyy-MM-dd}");
			}
			return File(System.Text.Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "clients.csv");
		}
	}
}


