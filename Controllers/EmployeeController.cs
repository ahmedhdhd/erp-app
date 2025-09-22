using System;
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
	public class EmployeeController : ControllerBase
	{
		private readonly EmployeeService _service;

		public EmployeeController(EmployeeService service)
		{
			_service = service;
		}

		[HttpGet]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<EmployeeListResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string? searchTerm = null)
		{
			var result = await _service.GetAllAsync(page, pageSize, searchTerm);
			return Ok(result);
		}

		[HttpPost("search")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<EmployeeListResponse>>> Search([FromBody] EmployeeSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			return Ok(result);
		}

		[HttpGet("{id}")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<EmployeeDTO>>> GetById([FromRoute] int id)
		{
			var result = await _service.GetByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,RH")]
		public async Task<ActionResult<EmployeeApiResponse<EmployeeDTO>>> Create([FromBody] CreateEmployeeRequest request)
		{
			var result = await _service.CreateAsync(request);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,RH")]
		public async Task<ActionResult<EmployeeApiResponse<EmployeeDTO>>> Update([FromRoute] int id, [FromBody] UpdateEmployeeRequest request)
		{
			var result = await _service.UpdateAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,RH")]
		public async Task<ActionResult<EmployeeApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _service.DeleteAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPatch("{id}/status")]
		[Authorize(Roles = "Admin,RH")]
		public async Task<ActionResult<EmployeeApiResponse<bool>>> UpdateStatus([FromRoute] int id, [FromBody] string newStatus)
		{
			var result = await _service.UpdateStatusAsync(id, newStatus);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpGet("statistics")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<EmployeeStatsResponse>>> GetStats()
		{
			var result = await _service.GetStatsAsync();
			return Ok(result);
		}

		[HttpGet("statistics/departments")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<System.Collections.Generic.List<DepartmentResponse>>>> GetDepartmentStats()
		{
			var list = await _service.GetDepartmentStatsAsync();
			return Ok(list);
		}

		[HttpGet("statistics/positions")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<System.Collections.Generic.List<PositionResponse>>>> GetPositionStats()
		{
			var list = await _service.GetPositionStatsAsync();
			return Ok(list);
		}

		[HttpGet("departments")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<System.Collections.Generic.List<string>>>> GetDepartments()
		{
			var data = await _service.GetDepartmentsAsync();
			return Ok(new EmployeeApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow });
		}

		[HttpGet("positions")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<System.Collections.Generic.List<string>>>> GetPositions()
		{
			var data = await _service.GetPositionsAsync();
			return Ok(new EmployeeApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow });
		}

		[HttpGet("statuses")]
		[Authorize]
		public async Task<ActionResult<EmployeeApiResponse<System.Collections.Generic.List<string>>>> GetStatuses()
		{
			var data = await _service.GetStatusesAsync();
			return Ok(new EmployeeApiResponse<System.Collections.Generic.List<string>> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow });
		}

		[HttpPost("export/csv")]
		[Authorize]
		public async Task<IActionResult> ExportToCsv([FromBody] EmployeeSearchRequest request)
		{
			var result = await _service.SearchAsync(request);
			if (!result.Success || result.Data == null) return BadRequest("Aucune donnée à exporter");

			var sb = new StringBuilder();
			sb.AppendLine("Id;Nom;Prenom;CIN;Poste;Departement;Email;Telephone;SalaireTotal;Statut;DateEmbauche");
			foreach (var e in result.Data.Employees)
			{
				sb.AppendLine($"{e.Id};{e.Nom};{e.Prenom};{e.CIN};{e.Poste};{e.Departement};{e.Email};{e.Telephone};{e.SalaireTotal};{e.Statut};{e.DateEmbauche:yyyy-MM-dd}");
			}

			return File(System.Text.Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "employees.csv");
		}
	}
}


