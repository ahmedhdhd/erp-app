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
	public class CommandeVenteController : ControllerBase
	{
		private readonly CommandeVenteService _commandeVenteService;

		public CommandeVenteController(CommandeVenteService commandeVenteService)
		{
			_commandeVenteService = commandeVenteService;
		}

		// Sales Order endpoints
		[HttpGet("commandes")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<CommandeVenteListResponse>>> GetAllCommandes([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
		{
			var result = await _commandeVenteService.GetAllAsync(page, pageSize);
			return Ok(result);
		}

		[HttpPost("commandes/search")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<CommandeVenteListResponse>>> SearchCommandes([FromBody] CommandeVenteSearchRequest request)
		{
			var result = await _commandeVenteService.SearchAsync(request);
			return Ok(result);
		}

		[HttpGet("commandes/{id}")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<CommandeVenteDTO>>> GetCommandeById([FromRoute] int id)
		{
			var result = await _commandeVenteService.GetByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("commandes")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<CommandeVenteDTO>>> CreateCommande([FromBody] CreateCommandeVenteRequest request)
		{
			// Get current user information
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
			var userNameClaim = User.FindFirst(ClaimTypes.Name);
			
			var userId = userIdClaim != null && int.TryParse(userIdClaim.Value, out int id) ? id : 0;
			var userName = userNameClaim?.Value ?? "Utilisateur inconnu";
			
			var result = await _commandeVenteService.CreateAsync(request, userId, userName);
			return Ok(result);
		}

		[HttpPut("commandes/{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<CommandeVenteDTO>>> UpdateCommande([FromRoute] int id, [FromBody] UpdateCommandeVenteRequest request)
		{
			var result = await _commandeVenteService.UpdateAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("commandes/{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<bool>>> DeleteCommande([FromRoute] int id)
		{
			var result = await _commandeVenteService.DeleteAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("commandes/{commandeId}/submit")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<CommandeVenteDTO>>> SubmitCommande([FromRoute] int commandeId)
		{
			// Get current user information
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
			var userNameClaim = User.FindFirst(ClaimTypes.Name);
			
			var userId = userIdClaim != null && int.TryParse(userIdClaim.Value, out int id) ? id : 0;
			var userName = userNameClaim?.Value ?? "Utilisateur inconnu";
			
			var result = await _commandeVenteService.SubmitAsync(commandeId, userId, userName);
			if (!result.Success) return BadRequest(result);
			return Ok(result);
		}

		// Sales Quote endpoints
		[HttpGet("devis")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<DevisListResponse>>> GetAllDevis([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
		{
			var result = await _commandeVenteService.GetAllDevisAsync(page, pageSize);
			return Ok(result);
		}

		[HttpPost("devis/search")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<DevisListResponse>>> SearchDevis([FromBody] DevisSearchRequest request)
		{
			var result = await _commandeVenteService.SearchDevisAsync(request);
			return Ok(result);
		}

		[HttpGet("devis/{id}")]
		[Authorize]
		public async Task<ActionResult<ClientApiResponse<DevisDTO>>> GetDevisById([FromRoute] int id)
		{
			var result = await _commandeVenteService.GetDevisByIdAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("devis")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<DevisDTO>>> CreateDevis([FromBody] CreateDevisRequest request)
		{
			var result = await _commandeVenteService.CreateDevisAsync(request);
			return Ok(result);
		}

		[HttpPut("devis/{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<DevisDTO>>> UpdateDevis([FromRoute] int id, [FromBody] UpdateDevisRequest request)
		{
			var result = await _commandeVenteService.UpdateDevisAsync(id, request);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpDelete("devis/{id}")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<bool>>> DeleteDevis([FromRoute] int id)
		{
			var result = await _commandeVenteService.DeleteDevisAsync(id);
			if (!result.Success) return NotFound(result);
			return Ok(result);
		}

		[HttpPost("devis/{devisId}/submit")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<DevisDTO>>> SubmitDevis([FromRoute] int devisId)
		{
			var result = await _commandeVenteService.SubmitDevisAsync(devisId);
			if (!result.Success) return BadRequest(result);
			return Ok(result);
		}

		[HttpPost("devis/{devisId}/accept")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<DevisDTO>>> AcceptDevis([FromRoute] int devisId)
		{
			var result = await _commandeVenteService.AcceptDevisAsync(devisId);
			if (!result.Success) return BadRequest(result);
			return Ok(result);
		}

		// Other Sales endpoints (deliveries, invoices, returns) would go here
		// For now, we'll add placeholder endpoints
		[HttpPost("livraisons")]
		[Authorize(Roles = "Admin,Vendeur,StockManager")]
		public async Task<ActionResult<ClientApiResponse<bool>>> CreateLivraison([FromBody] CreateLivraisonRequest request)
		{
			// This is a placeholder implementation
			return Ok(new ClientApiResponse<bool>
			{
				Success = true,
				Message = "Delivery functionality not yet implemented",
				Data = true,
				Timestamp = System.DateTime.UtcNow
			});
		}

		[HttpPost("factures")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<bool>>> CreateFacture([FromBody] CreateFactureVenteRequest request)
		{
			// This is a placeholder implementation
			return Ok(new ClientApiResponse<bool>
			{
				Success = true,
				Message = "Invoice functionality not yet implemented",
				Data = true,
				Timestamp = System.DateTime.UtcNow
			});
		}

		[HttpPost("retours")]
		[Authorize(Roles = "Admin,Vendeur")]
		public async Task<ActionResult<ClientApiResponse<bool>>> CreateRetour([FromBody] CreateRetourVenteRequest request)
		{
			// This is a placeholder implementation
			return Ok(new ClientApiResponse<bool>
			{
				Success = true,
				Message = "Return functionality not yet implemented",
				Data = true,
				Timestamp = System.DateTime.UtcNow
			});
		}
	}
}