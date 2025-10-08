using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace App.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class CommandeAchatController : ControllerBase
	{
		private readonly CommandeAchatService _commandeAchatService;

		public CommandeAchatController(CommandeAchatService commandeAchatService)
		{
			_commandeAchatService = commandeAchatService;
		}

		[HttpGet]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<CommandeAchatListResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
		{
			var result = await _commandeAchatService.GetAllAsync(page, pageSize);
			return Ok(result);
		}

		[HttpPost("search")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<CommandeAchatListResponse>>> Search([FromBody] CommandeAchatSearchRequest request)
		{
			var result = await _commandeAchatService.SearchAsync(request);
			return Ok(result);
		}

		[HttpGet("{id}")]
		[Authorize]
		public async Task<ActionResult<FournisseurApiResponse<CommandeAchatDTO>>> GetById([FromRoute] int id)
		{
			var result = await _commandeAchatService.GetByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<CommandeAchatDTO>>> Create([FromBody] CreateCommandeAchatRequest request)
		{
			// Get current user information
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
			var userNameClaim = User.FindFirst(ClaimTypes.Name);
			
			var userId = userIdClaim != null && int.TryParse(userIdClaim.Value, out int id) ? id : 0;
			var userName = userNameClaim?.Value ?? "Utilisateur inconnu";
			
			var result = await _commandeAchatService.CreateAsync(request, userId, userName);
			return Ok(result);
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<CommandeAchatDTO>>> Update([FromRoute] int id, [FromBody] UpdateCommandeAchatRequest request)
		{
			var result = await _commandeAchatService.UpdateAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<bool>>> Delete([FromRoute] int id)
		{
			var result = await _commandeAchatService.DeleteAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("{commandeId}/submit")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<CommandeAchatDTO>>> Submit([FromRoute] int commandeId)
		{
			var result = await _commandeAchatService.SubmitAsync(commandeId);
			if (!result.Success) return BadRequest(result);
			return Ok(result);
		}

		[HttpPost("{commandeId}/receive")]
		[Authorize(Roles = "Admin,Acheteur,StockManager")]
		public async Task<ActionResult<FournisseurApiResponse<ReceptionDTO>>> Receive([FromRoute] int commandeId, [FromBody] CreateReceptionRequest request)
		{
			// Get current user information
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
			var userNameClaim = User.FindFirst(ClaimTypes.Name);
			
			var userId = userIdClaim != null && int.TryParse(userIdClaim.Value, out int id) ? id : 0;
			var userName = userNameClaim?.Value ?? "Utilisateur inconnu";
			
			var result = await _commandeAchatService.ReceiveAsync(commandeId, request, userId, userName);
			if (!result.Success) return BadRequest(result);
			return Ok(result);
		}

		[HttpPost("{commandeId}/invoice")]
		[Authorize(Roles = "Admin,Acheteur")]
		public async Task<ActionResult<FournisseurApiResponse<FactureAchatDTO>>> CreateInvoice([FromRoute] int commandeId, [FromBody] CreateFactureAchatRequest request)
		{
			// This is a placeholder implementation
			return Ok(new FournisseurApiResponse<FactureAchatDTO> 
			{ 
				Success = true, 
				Message = "Purchase invoice functionality not yet implemented", 
				Data = new FactureAchatDTO(),
				Timestamp = System.DateTime.UtcNow 
			});
		}

		[HttpPost("test-product-update/{productId}/{quantityChange}")]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<FournisseurApiResponse<bool>>> TestProductUpdate([FromRoute] int productId, [FromRoute] int quantityChange)
		{
			var result = await _commandeAchatService.TestProductUpdate(productId, quantityChange);
			if (!result.Success) return BadRequest(result);
			return Ok(result);
		}
	}
}