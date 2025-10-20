using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReglementController : ControllerBase
    {
        private readonly ReglementService _service;
        private readonly App.Data.Interfaces.IReglementDAO _dao;
        public ReglementController(ReglementService service, App.Data.Interfaces.IReglementDAO dao)
        {
            _service = service;
            _dao = dao;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Comptable,Acheteur,Vendeur")]
        public async Task<ActionResult<ClientApiResponse<ReglementDTO>>> Create([FromBody] CreateReglementRequest request)
        {
            var result = await _service.CreateAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Comptable,Acheteur,Vendeur")]
        public async Task<ActionResult<ClientApiResponse<ReglementDTO>>> Update([FromRoute] int id, [FromBody] UpdateReglementRequest request)
        {
            request.Id = id;
            var result = await _service.UpdateAsync(request);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Comptable")]
        public async Task<ActionResult<ClientApiResponse<bool>>> Delete([FromRoute] int id)
        {
            var result = await _service.DeleteAsync(id);
            return Ok(result);
        }

        [HttpGet("commande-achat/{commandeId}")]
        [Authorize(Roles = "Admin,Comptable,Acheteur")]
        public async Task<ActionResult<ClientApiResponse<System.Collections.Generic.List<App.Models.Reglement>>>> GetByCommandeAchat([FromRoute] int commandeId)
        {
            var items = await _dao.GetByCommandeAchatAsync(commandeId);
            return Ok(Success(items));
        }

        [HttpGet("commande-vente/{commandeId}")]
        [Authorize(Roles = "Admin,Comptable,Vendeur")]
        public async Task<ActionResult<ClientApiResponse<System.Collections.Generic.List<App.Models.Reglement>>>> GetByCommandeVente([FromRoute] int commandeId)
        {
            var items = await _dao.GetByCommandeVenteAsync(commandeId);
            return Ok(Success(items));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Comptable,Acheteur,Vendeur")]
        public async Task<ActionResult<ClientApiResponse<App.Models.Reglement?>>> GetById([FromRoute] int id)
        {
            var item = await _dao.GetByIdAsync(id);
            return Ok(Success(item));
        }

        private static ClientApiResponse<T> Success<T>(T data)
        {
            return new ClientApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = System.DateTime.UtcNow };
        }
    }
}


